const { supabaseAdmin } = require('../config/supabase');
const { generateCertificatePDF } = require('../utils/certificate');
const { logActivity } = require('../utils/activityLog');
const { v4: uuidv4 } = require('uuid');

// POST /api/certificates/generate/:eventId/:studentId
exports.generateCertificate = async (req, res) => {
  try {
    const { eventId, studentId } = req.params;

    // Check attendance
    const { data: attendance } = await supabaseAdmin
      .from('attendance')
      .select('id')
      .eq('student_id', studentId)
      .eq('event_id', eventId)
      .eq('status', 'present')
      .maybeSingle();

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'Student did not attend this event' });
    }

    // Check if already generated
    const { data: existing } = await supabaseAdmin
      .from('certificates')
      .select('id')
      .eq('student_id', studentId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Certificate already generated. Use regenerate.' });
    }

    // Fetch student and event
    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .eq('id', studentId)
      .single();

    const { data: event } = await supabaseAdmin
      .from('events')
      .select('id, title, date, creator:profiles!created_by(name)')
      .eq('id', eventId)
      .single();

    const certificateId = uuidv4();

    // Generate PDF buffer
    const { buffer, fileName } = await generateCertificatePDF(
      student.name,
      event.title,
      event.date,
      event.creator?.name || 'CampusCast',
      certificateId
    );

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('certificates')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: urlData } = supabaseAdmin.storage.from('certificates').getPublicUrl(fileName);
    const downloadUrl = urlData.publicUrl;

    // Insert certificate record
    const { data: cert, error: certError } = await supabaseAdmin
      .from('certificates')
      .insert({
        certificate_id: certificateId,
        student_id: studentId,
        event_id: eventId,
        download_url: downloadUrl,
      })
      .select()
      .single();

    if (certError) throw certError;

    await logActivity(req.user.id, 'Generated certificate', 'certificate', cert.id, `${student.name} - ${event.title}`);

    res.status(201).json({
      success: true,
      message: 'Certificate generated',
      data: { certificate: normalizeCert(cert) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/certificates/regenerate/:certId
exports.regenerateCertificate = async (req, res) => {
  try {
    const { data: cert, error: fetchError } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('id', req.params.certId)
      .single();

    if (fetchError || !cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', cert.student_id)
      .single();

    const { data: event } = await supabaseAdmin
      .from('events')
      .select('title, date, creator:profiles!created_by(name)')
      .eq('id', cert.event_id)
      .single();

    const { buffer, fileName } = await generateCertificatePDF(
      student.name,
      event.title,
      event.date,
      event.creator?.name || 'CampusCast',
      cert.certificate_id
    );

    // Overwrite in storage
    await supabaseAdmin.storage
      .from('certificates')
      .upload(fileName, buffer, { contentType: 'application/pdf', upsert: true });

    const { data: urlData } = supabaseAdmin.storage.from('certificates').getPublicUrl(fileName);

    const { data: updated } = await supabaseAdmin
      .from('certificates')
      .update({ download_url: urlData.publicUrl, generated_at: new Date().toISOString() })
      .eq('id', cert.id)
      .select()
      .single();

    res.json({
      success: true,
      message: 'Certificate regenerated',
      data: { certificate: normalizeCert(updated) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/my
exports.getMyCertificates = async (req, res) => {
  try {
    const { data: certs, error } = await supabaseAdmin
      .from('certificates')
      .select('*, event:events(id, title, date, venue)')
      .eq('student_id', req.user.id)
      .order('generated_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { certificates: certs.map(normalizeCert) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/verify/:certificateId
exports.verifyCertificate = async (req, res) => {
  try {
    const { data: cert, error } = await supabaseAdmin
      .from('certificates')
      .select('*, student:profiles!student_id(id, name, email), event:events(id, title, date, venue)')
      .eq('certificate_id', req.params.certificateId)
      .single();

    if (error || !cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found or invalid' });
    }

    res.json({ success: true, data: { certificate: normalizeCert(cert), verified: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/certificates/download/:certId
exports.downloadCertificate = async (req, res) => {
  try {
    const { data: cert, error } = await supabaseAdmin
      .from('certificates')
      .select('download_url')
      .eq('id', req.params.certId)
      .single();

    if (error || !cert || !cert.download_url) {
      return res.status(404).json({ success: false, message: 'Certificate not available' });
    }

    // Redirect to Supabase Storage public URL
    res.redirect(cert.download_url);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function normalizeCert(cert) {
  if (!cert) return null;
  return {
    ...cert,
    _id: cert.id,
    certificateId: cert.certificate_id,
    downloadUrl: cert.download_url,
    generatedAt: cert.generated_at,
    student: cert.student ? { ...cert.student, _id: cert.student.id } : cert.student_id,
    event: cert.event ? { ...cert.event, _id: cert.event.id } : cert.event_id,
  };
}

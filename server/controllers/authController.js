const { supabase, supabaseAdmin } = require('../config/supabase');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Sign up with Supabase Auth — triggers handle_new_user to insert into profiles
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'student' },
      },
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!data.session) {
      // Supabase email confirmation required — but we'll still return success
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please confirm your email if required.',
        data: { user: { id: data.user.id, email: data.user.email, name, role: 'student' } },
      });
    }

    const token = data.session.access_token;
    const user = { id: data.user.id, _id: data.user.id, email, name, role: 'student' };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Fetch profile to get name and role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const token = data.session.access_token;
    const user = {
      id: data.user.id,
      _id: data.user.id,
      email: data.user.email,
      name: profile?.name || '',
      role: profile?.role || 'student',
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/admin/login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    // Verify admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = data.session.access_token;
    const user = {
      id: data.user.id,
      _id: data.user.id,
      email: data.user.email,
      name: profile.name,
      role: profile.role,
    };

    res.json({
      success: true,
      message: 'Admin login successful',
      data: { user, token },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: { user: { ...profile, _id: profile.id } } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/admin/seed — creates the first admin user
exports.seedAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const adminEmail = 'admin@campuscast.com';
    const adminPassword = 'Admin@123456';

    // Create auth user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: 'Admin', role: 'admin' },
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // Upsert profile with admin role (trigger may have already created it)
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      name: 'Admin',
      email: adminEmail,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { email: adminEmail, password: adminPassword },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

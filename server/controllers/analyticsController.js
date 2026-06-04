const { supabaseAdmin } = require('../config/supabase');

exports.getDashboardStats = async (req, res) => {
  try {
    // Use RPC for aggregated stats
    const { data: stats, error } = await supabaseAdmin.rpc('get_dashboard_stats');
    if (error) throw error;

    // Recent activity from admin_logs
    const { data: recentActivity } = await supabaseAdmin
      .from('admin_logs')
      .select('*, admin:profiles!admin_id(name)')
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      data: {
        totalEvents: stats.totalEvents,
        totalRegistrations: stats.totalRegistrations,
        totalTeams: stats.totalTeams,
        totalAttendance: stats.totalAttendance,
        attendanceRate: stats.attendanceRate,
        recentActivity: (recentActivity || []).map((log) => ({
          ...log,
          _id: log.id,
          admin: log.admin ? { ...log.admin, _id: log.admin_id } : null,
          createdAt: log.created_at,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegistrationAnalytics = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_registration_analytics');
    if (error) throw error;

    const { count: total } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: {
        chartData: (data || []).map((row) => ({
          eventTitle: row.event_title,
          registrations: Number(row.registrations),
        })),
        total: total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_attendance_analytics');
    if (error) throw error;

    const chartData = (data || []).map((row) => ({
      eventTitle: row.event_title,
      registered: Number(row.registered),
      present: Number(row.present),
      absent: Number(row.absent),
      percentage: parseFloat(row.percentage),
    }));

    const totalPresent = chartData.reduce((s, r) => s + r.present, 0);
    const totalAbsent = chartData.reduce((s, r) => s + r.absent, 0);

    res.json({
      success: true,
      data: { chartData, totalPresent, totalAbsent },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTeamAnalytics = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_team_analytics');
    if (error) throw error;

    res.json({
      success: true,
      data: {
        totalTeams: Number(data.totalTeams || 0),
        averageSize: parseFloat(data.averageSize || 0),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeedbackAnalytics = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_feedback_analytics');
    if (error) throw error;

    res.json({
      success: true,
      data: {
        averageRating: parseFloat(data.averageRating || 0),
        total: Number(data.total || 0),
        distribution: data.distribution || [0, 0, 0, 0, 0],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

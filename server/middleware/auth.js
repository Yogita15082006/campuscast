const { supabaseAdmin } = require('../config/supabase');

/**
 * protect — validates Supabase JWT from Authorization: Bearer header.
 * Fetches the user's profile from the profiles table and attaches to req.user.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    // Validate token with Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
    }

    // Fetch profile (name, role, etc.)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ success: false, message: 'User profile not found' });
    }

    // Attach user to request (same shape as before)
    req.user = {
      _id: profile.id,      // keep _id alias for backward compat with all controllers
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
};

const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied. Students only.' });
  }
};

module.exports = { protect, adminOnly, studentOnly };

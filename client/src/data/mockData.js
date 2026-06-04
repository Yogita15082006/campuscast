export const mockData = {
  events: [
    {
      id: 'evt-1',
      title: 'Spring Tech Symposium 2024',
      category: 'Technical',
      date: '2024-05-15',
      time: '09:00 AM',
      venue: 'Main Auditorium',
      capacity: 500,
      registered: 450,
      seatsRemaining: 50,
      deadline: '2024-05-10',
      isTeamEvent: false,
      teamSizeLimit: 1,
      description: "Join us for the annual tech symposium featuring keynote speakers from top tech companies, interactive workshops, and networking opportunities. This year's focus is on AI and sustainable technology.",
      posterUrl: 'https://picsum.photos/800/400?random=1',
      organizer: 'Computer Science Dept',
      status: 'upcoming'
    },
    {
      id: 'evt-2',
      title: 'Campus Cultural Fest',
      category: 'Cultural',
      date: '2024-06-01',
      time: '04:00 PM',
      venue: 'Open Air Theatre',
      capacity: 1000,
      registered: 1000,
      seatsRemaining: 0,
      deadline: '2024-05-25',
      isTeamEvent: true,
      teamSizeLimit: 15,
      description: 'The biggest cultural extravaganza of the year. Music, dance, drama, and art competitions across 3 days.',
      posterUrl: 'https://picsum.photos/800/400?random=2',
      organizer: 'Student Council',
      status: 'upcoming'
    },
    {
      id: 'evt-3',
      title: 'Inter-College Basketball Tournament',
      category: 'Sports',
      date: '2024-05-20',
      time: '10:00 AM',
      venue: 'Indoor Sports Complex',
      capacity: 32,
      registered: 28,
      seatsRemaining: 4,
      deadline: '2024-05-15',
      isTeamEvent: true,
      teamSizeLimit: 12,
      description: 'Annual inter-college basketball championship. Bring your A-game and compete with the best teams!',
      posterUrl: 'https://picsum.photos/800/400?random=3',
      organizer: 'Sports Committee',
      status: 'upcoming'
    },
    {
      id: 'evt-4',
      title: 'Web3 & Blockchain Workshop',
      category: 'Workshop',
      date: '2024-05-18',
      time: '02:00 PM',
      venue: 'Lab 3, CS Block',
      capacity: 60,
      registered: 55,
      seatsRemaining: 5,
      deadline: '2024-05-16',
      isTeamEvent: false,
      teamSizeLimit: 1,
      description: 'A hands-on workshop on building decentralized applications using Ethereum and Solidity.',
      posterUrl: 'https://picsum.photos/800/400?random=4',
      organizer: 'Blockchain Club',
      status: 'upcoming'
    },
    {
      id: 'evt-5',
      title: 'Photography Walk',
      category: 'Cultural',
      date: '2024-05-22',
      time: '06:00 AM',
      venue: 'Campus Gates',
      capacity: 40,
      registered: 15,
      seatsRemaining: 25,
      deadline: '2024-05-21',
      isTeamEvent: false,
      teamSizeLimit: 1,
      description: 'Early morning campus photography walk guided by professional photographers.',
      posterUrl: 'https://picsum.photos/800/400?random=5',
      organizer: 'Photography Club',
      status: 'upcoming'
    },
    {
      id: 'evt-6',
      title: 'Hackathon 2024',
      category: 'Technical',
      date: '2024-06-10',
      time: '08:00 AM',
      venue: 'Innovation Center',
      capacity: 200,
      registered: 120,
      seatsRemaining: 80,
      deadline: '2024-06-05',
      isTeamEvent: true,
      teamSizeLimit: 4,
      description: '24-hour hackathon. Build innovative solutions for real-world problems and win exciting prizes.',
      posterUrl: 'https://picsum.photos/800/400?random=6',
      organizer: 'Tech Society',
      status: 'upcoming'
    },
    {
      id: 'evt-7',
      title: 'Alumni Networking Dinner',
      category: 'Workshop',
      date: '2024-05-25',
      time: '07:00 PM',
      venue: 'Grand Hall',
      capacity: 150,
      registered: 150,
      seatsRemaining: 0,
      deadline: '2024-05-20',
      isTeamEvent: false,
      teamSizeLimit: 1,
      description: 'Connect with successful alumni across various industries over a formal dinner.',
      posterUrl: 'https://picsum.photos/800/400?random=7',
      organizer: 'Alumni Association',
      status: 'upcoming'
    },
    {
      id: 'evt-8',
      title: 'Robotics Showcase',
      category: 'Technical',
      date: '2024-05-30',
      time: '11:00 AM',
      venue: 'Engineering Block Plaza',
      capacity: 300,
      registered: 180,
      seatsRemaining: 120,
      deadline: '2024-05-28',
      isTeamEvent: true,
      teamSizeLimit: 5,
      description: 'Showcase of the latest robotics projects by students with live demonstrations.',
      posterUrl: 'https://picsum.photos/800/400?random=8',
      organizer: 'Robotics Club',
      status: 'upcoming'
    }
  ],
  registrations: [
    { id: 'reg-1', eventId: 'evt-1', eventName: 'Spring Tech Symposium 2024', date: '2024-05-15', venue: 'Main Auditorium', status: 'Confirmed' },
    { id: 'reg-2', eventId: 'evt-4', eventName: 'Web3 & Blockchain Workshop', date: '2024-05-18', venue: 'Lab 3, CS Block', status: 'Confirmed' },
    { id: 'reg-3', eventId: 'evt-6', eventName: 'Hackathon 2024', date: '2024-06-10', venue: 'Innovation Center', status: 'Pending' },
    { id: 'reg-4', eventId: 'evt-3', eventName: 'Inter-College Basketball Tournament', date: '2024-05-20', venue: 'Indoor Sports Complex', status: 'Confirmed' },
    { id: 'reg-5', eventId: 'evt-8', eventName: 'Robotics Showcase', date: '2024-05-30', venue: 'Engineering Block Plaza', status: 'Confirmed' }
  ],
  teams: [
    { id: 'team-1', name: 'Code Wizards', code: 'CW-4821', eventId: 'evt-6', eventName: 'Hackathon 2024', role: 'Leader', members: ['Alex Johnson', 'Sam Smith', 'Jamie Doe'], maxSize: 4 },
    { id: 'team-2', name: 'Hoop Dreams', code: 'HD-9031', eventId: 'evt-3', eventName: 'Inter-College Basketball Tournament', role: 'Member', members: ['Mike T.', 'Alex Johnson', 'Chris P.', 'Dave L.'], maxSize: 12 }
  ],
  attendance: [
    { id: 'att-1', eventName: 'Intro to React Workshop', date: '2024-04-10', status: 'Present', timeMarked: '02:05 PM' },
    { id: 'att-2', eventName: 'Guest Lecture: Future of AI', date: '2024-04-15', status: 'Present', timeMarked: '10:02 AM' },
    { id: 'att-3', eventName: 'Annual Sports Meet', date: '2024-04-20', status: 'Absent', timeMarked: '-' },
    { id: 'att-4', eventName: 'Design Thinking Seminar', date: '2024-04-25', status: 'Present', timeMarked: '11:15 AM' },
    { id: 'att-5', eventName: 'Resume Building Workshop', date: '2024-05-02', status: 'Present', timeMarked: '03:00 PM' }
  ],
  certificates: [
    { id: 'cert-1', eventName: 'Intro to React Workshop', date: '2024-04-10', certId: 'CC-2024-1042' },
    { id: 'cert-2', eventName: 'Design Thinking Seminar', date: '2024-04-25', certId: 'CC-2024-2198' },
    { id: 'cert-3', eventName: 'Resume Building Workshop', date: '2024-05-02', certId: 'CC-2024-3055' }
  ],
  announcements: [
    { id: 'ann-1', title: 'Venue Change for Tech Symposium', message: 'The venue for the Spring Tech Symposium has been moved to the Main Auditorium to accommodate more attendees.', date: '2 hours ago', unread: true },
    { id: 'ann-2', title: 'Hackathon Registration Closing Soon', message: "Last few spots remaining for Hackathon 2024. Register your teams before it's too late!", date: '1 day ago', unread: true },
    { id: 'ann-3', title: 'Certificates Available', message: 'Certificates for the Resume Building Workshop are now available for download.', date: '3 days ago', unread: false },
    { id: 'ann-4', title: 'Basketball Tryouts', message: 'Final tryouts for the inter-college team will be held tomorrow at 4 PM.', date: '1 week ago', unread: false },
    { id: 'ann-5', title: 'Guest Speaker Update', message: 'We are thrilled to announce that the CEO of TechCorp will be delivering the keynote at the Tech Symposium.', date: '2 weeks ago', unread: false },
    { id: 'ann-6', title: 'Welcome to CampusCast', message: 'The new event management platform is live. Explore upcoming events now!', date: '1 month ago', unread: false }
  ],
  feedback: [
    { id: 'fb-1', eventName: 'Intro to React Workshop', status: 'Submitted', rating: 5, date: '2024-04-11' },
    { id: 'fb-2', eventName: 'Guest Lecture: Future of AI', status: 'Pending', rating: null, date: null },
    { id: 'fb-3', eventName: 'Design Thinking Seminar', status: 'Pending', rating: null, date: null },
    { id: 'fb-4', eventName: 'Resume Building Workshop', status: 'Pending', rating: null, date: null }
  ],
  adminStats: {
    totalEvents: 12,
    totalRegistrations: 347,
    totalTeams: 43,
    avgAttendance: 78,
    pendingCerts: 12
  },
  chartData: {
    registrationsByEvent: {
      labels: ['Tech Symposium', 'Cultural Fest', 'Hackathon', 'Web3 Workshop', 'Robotics'],
      datasets: [{ label: 'Registrations', data: [450, 1000, 120, 55, 180], backgroundColor: 'rgba(79, 70, 229, 0.8)', borderRadius: 6 }]
    },
    attendanceBreakdown: {
      labels: ['Present', 'Absent'],
      datasets: [{ data: [78, 22], backgroundColor: ['rgba(16, 185, 129, 0.85)', 'rgba(244, 63, 94, 0.85)'], borderWidth: 0 }]
    },
    registrationsOverTime: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ label: 'New Registrations', data: [12, 19, 35, 25, 42, 65, 50], borderColor: 'rgba(124, 58, 237, 1)', backgroundColor: 'rgba(124, 58, 237, 0.1)', tension: 0.4, fill: true }]
    },
    attendancePerEvent: {
      labels: ['Tech Symposium', 'Cultural Fest', 'Basketball', 'Web3 Workshop', 'Robotics'],
      datasets: [{ label: 'Attendance %', data: [88, 72, 95, 80, 65], backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 6 }]
    },
    teamsByEvent: {
      labels: ['Cultural Fest', 'Basketball', 'Hackathon', 'Robotics'],
      datasets: [{ label: 'Teams Formed', data: [66, 16, 30, 36], backgroundColor: 'rgba(245, 158, 11, 0.8)', borderRadius: 6 }]
    },
    ratingsDistribution: {
      labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
      datasets: [{ label: 'Responses', data: [145, 80, 25, 10, 5], backgroundColor: 'rgba(124, 58, 237, 0.8)', borderRadius: 6 }]
    }
  },
  activityLog: [
    { id: 'log-1', action: 'Created new event: AI Workshop', time: '10 mins ago', admin: 'Sarah Admin' },
    { id: 'log-2', action: 'Approved 45 certificates', time: '1 hour ago', admin: 'Mike T.' },
    { id: 'log-3', action: 'Updated venue for Tech Symposium', time: '2 hours ago', admin: 'Sarah Admin' },
    { id: 'log-4', action: 'Sent announcement to all students', time: '3 hours ago', admin: 'Sarah Admin' },
    { id: 'log-5', action: 'Deleted event: Old Seminar', time: '1 day ago', admin: 'Mike T.' },
    { id: 'log-6', action: 'Generated attendance code for Basketball', time: '1 day ago', admin: 'Sarah Admin' },
    { id: 'log-7', action: 'Exported attendance report', time: '2 days ago', admin: 'Mike T.' },
    { id: 'log-8', action: 'Modified team size limit for Hackathon', time: '3 days ago', admin: 'Sarah Admin' }
  ],
  adminAttendance: [
    { id: 'sa-1', name: 'Alex Johnson', email: 'alex@university.edu', status: 'Present', timeMarked: '09:05 AM' },
    { id: 'sa-2', name: 'Maria Garcia', email: 'maria@university.edu', status: 'Present', timeMarked: '09:08 AM' },
    { id: 'sa-3', name: 'Tom Wilson', email: 'tom@university.edu', status: 'Absent', timeMarked: '-' },
    { id: 'sa-4', name: 'Sara Chen', email: 'sara@university.edu', status: 'Present', timeMarked: '09:12 AM' },
    { id: 'sa-5', name: 'James Lee', email: 'james@university.edu', status: 'Present', timeMarked: '09:15 AM' },
    { id: 'sa-6', name: 'Priya Patel', email: 'priya@university.edu', status: 'Absent', timeMarked: '-' },
    { id: 'sa-7', name: 'David Brown', email: 'david@university.edu', status: 'Present', timeMarked: '09:20 AM' },
    { id: 'sa-8', name: 'Emma Davis', email: 'emma@university.edu', status: 'Present', timeMarked: '09:22 AM' }
  ]
};

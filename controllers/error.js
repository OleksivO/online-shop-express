exports.getPageNotFound = (req, res, next) => {
    res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/not-found', isAuthenticated: req.session.isLoggedIn});
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', { pageTitle: 'Internal server error', path: '/500', isAuthenticated: req.session.isLoggedIn});
};
const Company = require('@models/company');

// Public controller functions that gets, but not changes all public
// company related information.
module.exports = {
    getCompanyIds: async (req, res, next) => {
        await Company.aggregate([{"$project": {_id: 1}}], function(err, companies) {
                if (err) {
                    return res.status(500).json({error: "db error"});
                }
                res.status(200).json({ids: companies.map(x => x._id)});
            });
    },
};

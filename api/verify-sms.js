// This file is no longer needed - verification is done client-side
// Kept for reference only
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ success: true, message: 'Verification handled client-side' });
};

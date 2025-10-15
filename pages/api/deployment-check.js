export default function handler(req, res) {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Check if YouTubePlayer.js exists
    const youTubePlayerPath = path.join(process.cwd(), 'components', 'YouTubePlayer.js');
    const youTubePlayerExists = fs.existsSync(youTubePlayerPath);
    
    // Check current git commit
    const gitCommit = process.env.GITHUB_SHA || 'unknown';
    
    // Check deployment time
    const deploymentTime = new Date().toISOString();
    
    res.status(200).json({
      status: 'success',
      deploymentTime,
      gitCommit,
      files: {
        YouTubePlayer: youTubePlayerExists,
        components: fs.existsSync(path.join(process.cwd(), 'components')),
        pages: fs.existsSync(path.join(process.cwd(), 'pages')),
        lib: fs.existsSync(path.join(process.cwd(), 'lib'))
      },
      workingDirectory: process.cwd(),
      nodeEnv: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      workingDirectory: process.cwd()
    });
  }
}

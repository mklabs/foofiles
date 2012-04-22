/**
* Tiny configuration module.
*
*	There, you can change repository information used to request Github API.
*		
*		user: github user account
*		repo: repository name to check out
* 	branch: branch name
*/

var config = module.exports = {};

config.data = {
    user: "ry",
    repo: 'node',
    branch: 'master'
};
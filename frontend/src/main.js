// importing named exports we use brackets
import {
    createPostTile, uploadImage, getCookie, getDomById, setCookie, removeClass, addClass,
    numToDate,
    getDomByClassName, toDate
} from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';

var auth = {}// Login information is saved here
var pageIndex = 0;// The number of feeds skipped
var isGetFeed = false;// Whether the feed is in the acquisition, avoiding duplicate requests
var isLoginUser = false;// Is it logged in

const api = new API();

var user = isLogin();// Go to the page Try to get user information

if (user) {// Already logged in successfully into normal display
    var main = getDomById('main');
    main.style.cssText = 'display:block;'
}
else { // Login failed to display login box
    var logind = getDomById('login');
    logind.style.cssText = 'display:block;'
}

// log in Register-------------------------------------
export function isLogin() {
    var userInfo = getCookie('userinfo');
    var token = getCookie('token');
    if (userInfo == null || userInfo == undefined || token == null || token == undefined) {
        return false;
    }
    else {
        try {
            let user = JSON.parse(userInfo);
            if (!user) {
                return false;
            }
            else {
                loginToMain(user, token)
                isLoginUser = true;
                if (window.navigator.onLine) {
                    getUser();
                }
            }

        } catch (error) {
            return false;
        }
    }

}
//Switch after login
export function loginToMain(user, token) {
    auth.user = user;
    auth.token = token;
    let loginHtml = getDomById('login');
    let mainHtml = getDomById('main');
    //console.dir(auth)

    bindUser();
    removeClass(mainHtml, 'hide');
    addClass(loginHtml, 'hide');
    getFeed();
}
//Bind page user information
export function bindUser() {

    getDomById('name').innerHTML = auth.user.name
    getDomById('following_num').innerHTML = auth.user.following.length
    getDomById('followed_num').innerHTML = auth.user.followed_num
    getDomById('posts_num').innerHTML = auth.user.posts.length
}
//Login button click event
getDomById('login-submit').addEventListener('click', function (e) {

    e.stopPropagation();
    e.preventDefault();

    var username = getDomById('login-username').value;
    var password = getDomById('login-password').value;
    var error = getDomById('login-error');
    error.innerHTML = ''
    if (!username || !password) {
        error.innerHTML = 'username password error'
    }
    else {
        var rsult = api.loginApi(username, password);
        rsult.then(respo => {
            switch (respo.status) {
                case 200:
                    return Promise.resolve(respo.json());
                    break;
                case 400:
                    error.innerHTML = 'Missing Username/Password';
                    return Promise.reject();
                    break;
                case 403:
                    error.innerHTML = 'Invalid Username/Password';
                    return Promise.reject();
                    break;
            }
        })
            .then(json => {
                setCookie('token', json.token);
                return Promise.resolve(json.token);
            })
            .then(token => {
                let dst = api.getUser(token, username);
                return dst;
            })
            .then(respo => {
                switch (respo.status) {
                    case 200:
                        return Promise.resolve(respo.json());
                        break;
                    case 400:
                        error.innerHTML = 'Malformed Request';
                        return Promise.reject();
                        break;
                    case 403:
                        error.innerHTML = 'Invalid Auth Token';
                        return Promise.reject();
                        break;
                }
            })
            .then(userJson => {
                setCookie('userinfo', JSON.stringify(userJson));
                loginToMain(userJson, getCookie('token'))
            })
    }


});
//Register button click event
getDomById('signup-submit').addEventListener('click', function (e) {

    e.stopPropagation();
    e.preventDefault();

    var username = getDomById('signup-username').value;
    var password = getDomById('signup-password').value;

    var email = getDomById('signup-email').value;
    var name = getDomById('signup-name').value;
    var error = getDomById('signup-error');

    error.innerHTML = ''
    if (!username || !password || !email || !name) {
        error.innerHTML = 'username or password or email or name error'
    }
    else {
        var rsult = api.signupApi(username, password, email, name);
        rsult.then(respo => {
            switch (respo.status) {
                case 200:
                    return Promise.resolve(respo.json());
                    break;
                case 400:
                    error.innerHTML = 'Malformed Request';
                    return Promise.reject();
                    break;
                case 409:
                    error.innerHTML = 'Username Taken';
                    return Promise.reject();
                    break;
            }
        })
            .then(json => {
                setCookie('token', json.token);
                return Promise.resolve(json.token);
            })
            .then(token => {
                let dst = api.getUser(token, username);
                return dst;
            })
            .then(respo => {
                switch (respo.status) {
                    case 200:
                        return Promise.resolve(respo.json());
                        break;
                    case 400:
                        error.innerHTML = 'Malformed Request';
                        return Promise.reject();
                        break;
                    case 403:
                        error.innerHTML = 'Invalid Auth Token';
                        return Promise.reject();
                        break;
                }
            })
            .then(userJson => {
                setCookie('userinfo', JSON.stringify(userJson));
                loginToMain(userJson, getCookie('token'))
                $('#signup-modal').modal('hide')
            })
    }


});


//Login Register-------------------------------------

// Feed -------------------------------------
//Get feed 
export function getFeed() {
    isGetFeed = true;
    let dom = getDomById('my-posts-main');
    if (pageIndex == 0) {
        dom.innerHTML = '';
    }

    var feed = api.getFeed(pageIndex, auth.token, 10);
    var error = getDomById('error_left')
    feed.then(respo => {
        switch (respo.status) {
            case 200:
                return Promise.resolve(respo.json());
                break;
            case 403:
                error.innerHTML = '<strong>error!</strong>Invalid Username/Password';
                removeClass(error, 'hide');
                return Promise.reject();
                break;
        }
    }).then(feed => {
        let html = getFeedHtml(feed.posts);
        dom.innerHTML += html;
        pageIndex += 10;
        isGetFeed = false;
    })
}

//Get the feed data to generate html
export function getFeedHtml(json) {
    let html = "";
    //sort 
    json = json.sort(function (a, b) {
        if (parseInt(a.meta.published.split('.')[0]) > parseInt(b.meta.published.split('.')[0]))
            return -1
        else
            return 1
    })
    for (var i = 0; i < json.length; i++) {
        let item = json[i];
        //console.dir(item)
        html += "<li id='" + item.id + "' data-id='" + item.id + "' class='my-posts-main-li'>"
        html += "<div class='posts-item-main'>"
        html += "<div class='posts-img-div'>"
        html += "<img src='data:image/png;base64," + item.src + "' class='img-thumbnail' width='100' height='100'>"
        html += "</div>"
        html += "<div class='posts-description'>"
        html += "<h5 data-author='" + item.meta.author + "' class='author'>" + item.meta.author + "</h5>"
        html += " <div class='posts-time'>" + numToDate(item.meta.published) + "</div>"
        html += item.meta.description_text
        html += "</div>"
        //html+= "<img src='data:image/png;base64,"+item.src+"' class='img-src ' >"
        html += "</div>"
        html += "<div class='infos-main'>"
        html += "<button class='btn btn-default btn-sm likeslist' data-likesall='" + JSON.stringify(item.meta.likes) + "' data-likes='" + item.meta.likes.length + "' data-status='" + (item.meta.likes.join(',').indexOf(auth.user.id) != -1) + "' data-id='" + item.id + "'  style='margin-right: 12px;'>likes"
        if (item.meta.likes.join(',').indexOf(auth.user.id) != -1) {
            html += "<span class='text-primary likeslist'>" + item.meta.likes.length + "</span>"
        }
        else {
            html += "<span class='text-secondary likeslist'>" + item.meta.likes.length + "</span>"
        }
        html += "</button>"

        html += "<button class='btn btn-default btn-sm likebtn' data-likes='" + item.meta.likes.length + "' data-status='" + (item.meta.likes.join(',').indexOf(auth.user.id) != -1) + "' data-id='" + item.id + "'  style='margin-right: 12px;'>"
        if (item.meta.likes.join(',').indexOf(auth.user.id) != -1) {
            html += "unlike"
        }
        else {
            html += "like"
        }
        html += "</button>"
        html += "<button class='btn btn-default btn-sm commentslist' data-comments='" + JSON.stringify(item.comments) + "' style='margin-right: 12px;'>"
        html += "comments"
        html += "<span class='text-primary commentslist'>" + item.comments.length + "</span>"
        html += "</button>"

        html += "<button data-id='" + item.id + "' class='btn btn-default btn-sm commentbtn'>comment</button>"
        html += "</div>"

        // html+=  "<div class='comments-main'>"
        // html+="<ol class='list-unstyled comments-ol'>"
        // html+="<li>"
        // html+="<a class='comments-username'>asdf</a>"
        // html+= "<span class='comments-text text-info'>Lorem ipsum dolor sit amet</span>"
        // html+= "</li>"
        // html+= "<li>"
        // html+= "<a class='comments-username'>asdf</a>"
        // html+= "<span class='comments-text text-info'>Lorem ipsum dolor sit amet</span>"
        // html+="</li>"
        // html+="<li>"
        // html+="<a class='comments-username'>asdf</a>"
        // html+="<span class='comments-text text-info'>Lorem ipsum dolor sit amet</span>"
        // html+="</li>"
        // html+="</ol>"
        // html+="</div>"

        html += "</li>"
    }
    return html;

}

// Feed-------------------------------------

//user-------------------------------------
//Click to display the update user information box
getDomById('name').addEventListener('click', function () {
    let upd_name = getDomById('upd-name');
    let upd_password = getDomById('upd-password');
    let upd_email = getDomById('upd-email');
    upd_name.value = auth.user.name;
    upd_password.value = '';
    upd_email.value = auth.user.email;
    getDomById('upd-error').innerHTML = ''

})
//update userinfo
//Update user information and click Save button
getDomById('upd-submit').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    let upd_name = getDomById('upd-name').value;
    let upd_password = getDomById('upd-password').value;
    let upd_email = getDomById('upd-email').value;
    let error = getDomById('upd-error')
    error.innerHTML = '';
    if (!upd_name || !upd_password || !upd_email) {
        error.innerHTML = '<strong>upd_name,upd_password,upd_email not null !</strong>';
        return false;
    }


    let resulr = api.putUser(auth.token, upd_name, upd_email, upd_password);

    resulr.then(respo => {
        switch (respo.status) {
            case 200:
                error.innerHTML = '<strong>success!</strong>';
                auth.user.name = upd_name;
                auth.user.email = upd_email;
                setCookie('userinfo', JSON.stringify(auth.user));
                bindUser();
                return Promise.reject();
                break;
            case 400:
                error.innerHTML = '<strong>error!</strong>Malformed user object';
                return Promise.reject();
                break;
            case 403:
                error.innerHTML = '<strong>error!</strong>Invalid Authorization Token';
                return Promise.reject();
                break;
        }
    })

})
//View follower information click event
getDomById('btn-myinfo').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    userInfo(auth.user.username)
})
//User Information Bulletin Follow and Unfollow Click Events
getDomById('user-info-follow').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    let dom = getDomById('user-info-follow');
    if (dom.innerHTML == "unfollow") {
        unFollowUser(dom.dataset.username)
    }
    else if (dom.innerHTML == "follow") {
        followUser(dom.dataset.username)
    }
})

//Get personal information
export function getUser() {
    var result = api.getUser(auth.token, auth.user.username)
    result
        .then(respo => {
            switch (respo.status) {
                case 200:
                    return Promise.resolve(respo.json());
                    break;
                case 400:
                    error.innerHTML = 'Malformed Request';
                    return Promise.reject();
                    break;
                case 403:
                    error.innerHTML = 'Invalid Auth Token';
                    return Promise.reject();
                    break;
            }
        })
        .then(userJson => {
            setCookie('userinfo', JSON.stringify(userJson));

            auth.user = userJson;
            console.dir(auth)
            bindUser();
        })
}

//Get other user's information
export function userInfo(username) {
    //$("#userinfo-modal").modal('hide');
    var result = api.getUser(auth.token, username)
    result
        .then(respo => {
            switch (respo.status) {
                case 200:
                    return Promise.resolve(respo.json());
                    break;
                case 400:
                    return Promise.reject();
                    break;
                case 403:
                    return Promise.reject();
                    break;
            }
        })
        .then(userJson => {
            getDomById('user-info-username').innerHTML = userJson.name;
            getDomById('user-info-post').innerHTML = 'post:' + userJson.posts.length;
            getDomById('user-info-following').innerHTML = 'following:' + userJson.following.length;
            getDomById('user-info-followed').innerHTML = 'followed:' + userJson.followed_num;

            let followbtn = getDomById('user-info-follow');
            followbtn.dataset.username = userJson.username
            if (username != auth.user.username) {
                if (auth.user.following.join(',').indexOf(userJson.id) != -1)//follow
                {
                    followbtn.innerHTML = 'unfollow';
                }
                else {
                    followbtn.innerHTML = 'follow';
                }
                removeClass(followbtn, 'hide');
            }
            else {
                addClass(followbtn, 'hide');
            }
            // console.dir(userJson)
            getDomById('user-posts-main').innerHTML = '';
            for (var i = 0; i < userJson.posts.length; i++) {
                let item = userJson.posts[i];
                getPost(item)
            }

        })

    $("#userinfo-modal").modal('show');
}

//Get a post detail
export function getPost(id) {
    let result = api.getPost(auth.token, id);
    result.then(respo => {
        switch (respo.status) {
            case 200:
                return Promise.resolve(respo.json());
                break;
            case 400:
                return Promise.reject();
                break;
            case 403:
                return Promise.reject();
                break;
        }
    })
        .then(item => {
            var html = '';
            html += "<li id='" + item.id + "' class='user-posts-main-li'>"
            html += "<div class='posts-item-main'>"
            html += "<div class='posts-img-div'>"
            html += "<img src='data:image/png;base64," + item.src + "' class='img-thumbnail' width='100' height='100'>"
            html += "</div>"
            html += "<div class='posts-description'>"
            html += "<h5 data-username='" + item.meta.author + "' class='author'>" + item.meta.author + "</h5>"
            html += " <div class='posts-time'>" + numToDate(item.meta.published) + "</div>"
            html += item.meta.description_text
            html += "</div>"
            html += "</div>"
            html += "<div class='infos-main'>"
            html += "<button class='btn btn-default btn-sm likeslist' data-likesall='" + JSON.stringify(item.meta.likes) + "' data-likes='" + item.meta.likes.length + "' data-status='" + (item.meta.likes.join(',').indexOf(auth.user.id) != -1) + "' data-id='" + item.id + "'  style='margin-right: 12px;'>likes"
            if (item.meta.likes.join(',').indexOf(auth.user.id) != -1) {
                html += "<span class='text-primary likeslist'>" + item.meta.likes.length + "</span>"
            }
            else {
                html += "<span class='text-secondary likeslist'>" + item.meta.likes.length + "</span>"
            }
            html += "</button>"
            html += "<button class='btn btn-default btn-sm commentslist' data-comments='" + JSON.stringify(item.comments) + "' style='margin-right: 12px;'>"
            html += "comments"
            html += "<span class='text-primary commentslist'>" + item.comments.length + "</span>"
            html += "</button>"
            if (item.meta.author == auth.user.username) {
                html += "<button class='btn btn-default btn-sm delbtn' data-id='" + item.id + "' style='margin-right: 12px;'>"
                html += "DELETE"
                html += "</button>"

                html += "<button class='btn btn-default btn-sm editbtn' data-post='" + JSON.stringify(item) + "' style='margin-right: 12px;'>"
                html += "EDIT"
                html += "</button>"
            }


            html += "</div>"
            html += "</li>"
            getDomById('user-posts-main').innerHTML += html;
        })
}

//follow others
export function followUser(username) {
    let result = api.followUser(auth.token, username);
    result.then(respo => {
        switch (respo.status) {
            case 200:
                userInfo(username)
                pageIndex = 0;
                getFeed();
                getUser();
                break;
            case 400:
                break;
            case 403:
                break;
        }
    })
}
//unfollow others
export function unFollowUser(username) {
    let result = api.unFollowUser(auth.token, username);
    result.then(respo => {
        switch (respo.status) {
            case 200:
                pageIndex = 0;
                userInfo(username)
               
                getFeed();
                getUser();
                break;
            case 400:
                break;
            case 403:
                break;
        }
    })
}

//user info box to post event list
getDomById('user-posts-main').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.target.className.indexOf('delbtn') != -1) {
        let id = e.target.dataset.id;
        deletePost(id)
    }
    else if (e.target.className.indexOf('editbtn') != -1) {
        let post = e.target.dataset.post;
        let json = JSON.parse(post)
        console.dir(json)
        let description = getDomById('updposts-description');
        description.value = json.meta.description_text
        description.dataset.post = post;
        $("#userinfo-modal").modal('hide');
        $('#updposts-modal').modal('show');
    }
})

//Update the post box and click save button
getDomById('updpost-submit').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();

    let description = getDomById('updposts-description');
    let srcIuput = getDomById('updposts-src');
    let uploadFile = srcIuput.files[0];

    let json = JSON.parse(description.dataset.post);
    if (!description.value || uploadFile == undefined || uploadFile == null || uploadFile.type != "image/png") {
        getDomById('updpost-error').innerHTML = 'description not null or img not png!'
        return false;
    }
    else {
        getDomById('updpost-error').innerHTML = ''
        let reader = new FileReader();

        reader.readAsDataURL(uploadFile);
        reader.onloadend = function () {
            let base64 = reader.result; // Base64 is the result of the conversion of the image
            let src = String(base64).replace('data:image/png;base64,', '');
            console.dir(src)
            editPost(description.value, src, json.id)
        };

    }
})

//Save post to backend
export function editPost(description_text, src, id) {
    let error = getDomById('updpost-error')

    let result = api.putPost(auth.token, description_text, src, id);
    result.then(respo => {

        switch (respo.status) {
            case 200:
                return Promise.resolve(respo.json());
                break;
            case 400:
                break;
            case 403:
                break;
        }
    })
        .then(json => {
            // pageIndex=0;
            //getFeed();
            error.innerHTML = '<strong>success!</strong>';
            getUser();
        })
}

//Search user
getDomById('search_btn').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();

    let search_username = getDomById('search_username').value;
    if (!search_username) {
        return false;
    }
    else {
        var result = api.getUser(auth.token, search_username)
        var not = '<tr><td colspan="3">not user</td></tr>'
        var search_users = getDomById('search_users');
        result
            .then(respo => {
                switch (respo.status) {
                    case 200:
                        return Promise.resolve(respo.json());
                        break;
                    case 400:
                        search_users.innerHTML = not;
                        return Promise.reject();
                        break;
                    case 403:
                        search_users.innerHTML = not;
                        return Promise.reject();
                        break;
                }
            })
            .then(userJson => {
                var tr = '<tr> <td> ' + userJson.username + ' </td> <td> ' + userJson.posts.length + ' </td> <td> '
                if (userJson.username != auth.user.username) {
                    if (auth.user.following.join(',').indexOf(userJson.id) != -1)//follow
                    {
                        tr += '<button data-username="'+userJson.username+'" type="button" class="btn btn-default search_follow">unfollow</button>'
                    }
                    else {
                        tr += '<button data-username="'+userJson.username+'" type="button" class="btn btn-default search_follow">follow</button>'
                    }
                   
                }

                tr += ' </td> </tr>'
                search_users.innerHTML = tr;


            })
    }
})

//Follow or unfollow after search users
getDomById('search_users').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    
    if (e.target.className.indexOf('search_follow') != -1) {
        console.dir(e.target)
        if (e.target.innerHTML == "unfollow") {
            unFollowUser(e.target.dataset.username)
        }
        else if (e.target.innerHTML == "follow") {
            followUser(e.target.dataset.username)
        }
        $('#search-modal').modal('hide')
    }

})

//user-------------------------------------

//post-------------------------------------
//Feed list click event
getDomById('my-posts-main').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.target.className.indexOf('likebtn') != -1) {
        likeClick(e)
    }
    else if (e.target.className.indexOf('commentbtn') != -1) {
        getDomById('comment_id').value = e.target.dataset.id;
        getDomById('comment-txt').value = ''
        $('#comment-modal').modal('show')//The modal box must be activated with a jq object
    }
    else if (e.target.className.indexOf('commentslist') != -1) {
        let comments = e.target.dataset.comments;
        let json = JSON.parse(comments)
        console.dir(JSON.parse(comments))
        showComments(json)
        if (json.length > 0)
            $('#comments-modal').modal('show')//The modal box must be activated with a jq object
    }
    else if (e.target.className.indexOf('likeslist') != -1) {
        let likes = e.target.dataset.likesall;
        let likeArr = JSON.parse(likes);
        getDomById('likes-ol').innerHTML = '';

        for (var i = 0; i < likeArr.length; i++) {
            let item = likeArr[i];
            showLikes(item)
        }
        if (likeArr.length > 0)
            $('#likes-modal').modal('show')//The modal box must be activated with a jq object
    }
    else if (e.target.className.indexOf('author') != -1) {
        userInfo(e.target.dataset.author);
    }

})



//like unlike 
export function likeClick(e) {
    let id = e.target.dataset.id;
    let status = String(e.target.dataset.status);
    let likes = parseInt(e.target.dataset.likes);
    let error = getDomById('error_left')
    error.innerHTML = '';
    if (status == 'true') {
        let result = api.postUnLike(auth.token, id);
        result.then(respo => {
            switch (respo.status) {
                case 200:
                    //  error.innerHTML = '<strong>Success</strong>';
                    //  removeClass(error, 'hide');
                    //  setTimeout(() => {
                    //     addClass(error,'hide')
                    // }, 1500);
                    e.target.dataset.likes = (likes - 1);
                    e.target.dataset.status = 'false';
                    e.target.innerHTML = "like";
                    break;
                case 400:
                    error.innerHTML = '<strong>error!</strong>Malformed Request';
                    removeClass(error, 'hide');
                    setTimeout(() => {
                        addClass(error, 'hide')
                    }, 1500);
                    break;
                case 403:
                    error.innerHTML = '<strong>error!</strong>Invalid Auth Token';
                    removeClass(error, 'hide');
                    setTimeout(() => {
                        addClass(error, 'hide')
                    }, 1500);
                    break;
            }
        })
    }
    else {
        let result1 = api.postLike(auth.token, id);
        result1.then(respo => {
            switch (respo.status) {
                case 200:
                    //  error.innerHTML = '<strong>Success</strong>';
                    //  removeClass(error, 'hide');
                    //  setTimeout(() => {
                    //     addClass(error,'hide')
                    // }, 1500);
                    e.target.dataset.likes = (likes + 1);
                    e.target.dataset.status = 'true';
                    e.target.innerHTML = "unlike";
                    break;
                case 400:
                    error.innerHTML = '<strong>error!</strong>Malformed Request';
                    removeClass(error, 'hide');
                    setTimeout(() => {
                        addClass(error, 'hide')
                    }, 1500);

                    break;
                case 403:
                    error.innerHTML = '<strong>error!</strong>Invalid Auth Token';
                    removeClass(error, 'hide');
                    setTimeout(() => {
                        addClass(error, 'hide')
                    }, 1500);
                    break;
            }
        })
    }
    updPost(id)
}
//Delete my post
export function deletePost(id) {
    let result = api.deletePost(auth.token, id);
    result.then(respo => {
        switch (respo.status) {
            case 200:
                getDomById('user-posts-main').innerHTML = '';
                for (var i = 0; i < auth.user.posts.length; i++) {
                    let item = auth.user.posts[i];
                    getPost(item)
                }
                getUser();
                break;
            case 400:
                break;
            case 403:
                break;
        }
    })

}

//create post
getDomById('addposts-modal-btn').addEventListener('click', function () {
    let description = getDomById('addposts-description');
    let src = getDomById('addposts-src');

    description.value = '';
    src.value = '';
    getDomById('post-error').innerHTML = ''
})
//create post and click save button
getDomById('post-submit').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();

    let description = getDomById('addposts-description').value;
    let srcIuput = getDomById('addposts-src');
    let uploadFile = srcIuput.files[0];
    if (!description || uploadFile == undefined || uploadFile == null || uploadFile.type != "image/png") {
        getDomById('post-error').innerHTML = 'description not null or img not png!'
        return false;
    }
    else {
        getDomById('post-error').innerHTML = ''
        let reader = new FileReader();

        reader.readAsDataURL(uploadFile);
        reader.onloadend = function () {
            let base64 = reader.result; // Base64 is the result of the conversion of the image 
            let src = String(base64).replace('data:image/png;base64,', '');
            createPost(description, src)
        };

    }




})
//Save post information to the backend
export function createPost(description_text, src) {
    let error = getDomById('post-error')

    let result = api.postCreate(auth.token, description_text, src);
    result.then(respo => {

        switch (respo.status) {
            case 200:
                return Promise.resolve(respo.json());
                break;
            case 400:
                error.innerHTML = '<strong>error!</strong>Malformed Request / Image could not be processed';
                removeClass(error, 'hide');
                setTimeout(() => {
                    addClass(error, 'hide')
                }, 1500);
                break;
            case 403:
                error.innerHTML = '<strong>error!</strong>Invalid Auth Token';
                removeClass(error, 'hide');
                setTimeout(() => {
                    addClass(error, 'hide')
                }, 1500);
                break;
        }
    })
        .then(json => {
            // pageIndex=0;
            //getFeed();
            error.innerHTML = '<strong>success!</strong>';
            getUser();
        })
}
//Click to save comment to backend in Comment box 
getDomById('comment-submit').addEventListener('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    let comment = getDomById('comment-txt').value;
    let id = getDomById('comment_id').value;
    postComment(comment, id);

})

//Save comment to backend
export function postComment(comment, id) {
    let error = getDomById('comment-error');
    if (!comment) {
        error.innerHTML = '<strong>error!</strong>comment not null';
        return false
    }

    let result = api.postComment(auth.token, auth.user.name, new Date().getSeconds(), comment, id);
    result.then(respo => {
        switch (respo.status) {
            case 200:
                $('#comment-modal').modal('hide')//Hidden modal boxes must use jq objects
                updPost(id);
                break;
            case 400:
                error.innerHTML = '<strong>error!</strong>Malformed Request';
                break;
            case 403:
                error.innerHTML = '<strong>error!</strong>Invalid Auth Token';
                break;
        }
    })
}

//Update the post of the page, have new comments and like will update the page display
export function updPost(id) {
    let dom = getDomById(id);
    let error = getDomById('error_left')
    let result = api.getPost(auth.token, id);
    result.then(respo => {
        switch (respo.status) {
            case 200:
                return Promise.resolve(respo.json());
                break;
            case 400:
                error.innerHTML = '<strong>error!</strong>Malformed Request';
                removeClass(error, 'hide');
                setTimeout(() => {
                    addClass(error, 'hide')
                }, 1500);
                return Promise.reject();
                break;
            case 403:
                error.innerHTML = '<strong>error!</strong>Invalid Auth Token';
                removeClass(error, 'hide');
                setTimeout(() => {
                    addClass(error, 'hide')
                }, 1500);
                return Promise.reject();
                break;
        }
    })
        .then(post => {
            var html = '';
            let item = post;
            // console.dir(post)
            html += "<div class='posts-item-main'>"
            html += "<div class='posts-img-div'>"
            html += "<img src='data:image/png;base64," + item.thumbnail + "' class='img-thumbnail' width='100' height='100'>"
            html += "</div>"
            html += "<div class='posts-description'>"
            html += "<h5 data-author='" + item.meta.author + "' class='author'>" + item.meta.author + "</h5>"
            html += " <div class='posts-time'>" + numToDate(item.meta.published) + "</div>"
            html += item.meta.description_text
            html += "</div>"
            //html+= "<img src='data:image/png;base64,"+item.src+"' class='img-src ' >"
            html += "</div>"
            html += "<div class='infos-main'>"
            html += "<button class='btn btn-default btn-sm likeslist' data-likesall='" + JSON.stringify(item.meta.likes) + "' data-likes='" + item.meta.likes.length + "' data-status='" + (item.meta.likes.join(',').indexOf(auth.user.id) != -1) + "' data-id='" + item.id + "'  style='margin-right: 12px;'>likes"
            if (item.meta.likes.join(',').indexOf(auth.user.id) != -1) {
                html += "<span class='text-primary likeslist'>" + item.meta.likes.length + "</span>"
            }
            else {
                html += "<span class='text-secondary likeslist'>" + item.meta.likes.length + "</span>"
            }
            html += "</button>"

            html += "<button class='btn btn-default btn-sm likebtn' data-likes='" + item.meta.likes.length + "' data-status='" + (item.meta.likes.join(',').indexOf(auth.user.id) != -1) + "' data-id='" + item.id + "'  style='margin-right: 12px;'>"
            if (item.meta.likes.join(',').indexOf(auth.user.id) != -1) {
                html += "unlike"
            }
            else {
                html += "like"
            }
            html += "</button>"
            html += "<button class='btn btn-default btn-sm commentslist' data-comments='" + JSON.stringify(item.comments) + "' style='margin-right: 12px;'>"
            html += "comments"
            html += "<span class='text-primary commentslist'>" + item.comments.length + "</span>"
            html += "</button>"

            html += "<button data-id='" + item.id + "' class='btn btn-default btn-sm commentbtn'>comment</button>"
            html += "</div>"

            // html+=  "<div class='comments-main'>"
            // html+="<ol class='list-unstyled comments-ol'>"
            // html+="<li>"
            // html+="<a class='comments-username'>asdf</a>"
            // html+= "<span class='comments-text text-info'>Lorem ipsum dolor sit amet</span>"
            // html+= "</li>"
            // html+= "<li>"
            // html+= "<a class='comments-username'>asdf</a>"
            // html+= "<span class='comments-text text-info'>Lorem ipsum dolor sit amet</span>"
            // html+="</li>"
            // html+="<li>"
            // html+="<a class='comments-username'>asdf</a>"
            // html+="<span class='comments-text text-info'>Lorem ipsum dolor sit amet</span>"
            // html+="</li>"
            // html+="</ol>"
            // html+="</div>"


            dom.innerHTML = html;

        })

}

//Show comment list box
export function showComments(comment) {
    let html = '';
    let dom = getDomById('comment-ol');
    dom.innerHTML = ''
    for (var i = 0; i < comment.length; i++) {
        let item = comment[i];
        html += "<li>"
        html += "<a class='comments-username'>" + item.author + "</a><span class='fr'>" + numToDate(item.published) + "</span><br>"
        html += "<span class='comments-text text-info'>" + item.comment + "</span>"
        html += "</li>"
    }
    dom.innerHTML = html
}
//Like list box
export function showLikes(id) {
    var result = api.getUserById(auth.token, id)
    result
        .then(respo => {
            switch (respo.status) {
                case 200:
                    return Promise.resolve(respo.json());
                    break;
                case 400:
                    error.innerHTML = 'Malformed Request';
                    return Promise.reject();
                    break;
                case 403:
                    error.innerHTML = 'Invalid Auth Token';
                    return Promise.reject();
                    break;
            }
        })
        .then(userJson => {
            let html = '';
            let dom = getDomById('likes-ol');
            html += "<li>"
            html += "<a class='comments-username'>name:" + userJson.name + "</a>"
            html += "<span class='comments-text text-info'>posts:" + userJson.posts.length + "</span>"
            html += "</li>"
            dom.innerHTML += html

        })


}

//post-------------------------------------


//Polling Get page information update data and follow-up user information-------------------------------------

var old = [];
setInterval(function () {

    if (isLoginUser) {

        let dom = getDomByClassName('my-posts-main-li')
        let arr = [];
        for (let i = 0; i < dom.length; i++) {
            // Traversal operation
            updPost(dom[i].dataset.id);
            arr.push(dom[i].dataset.id)
        }
        let asd = arr.join(',');
        // console.dir(asd)
        var feed = api.getFeed(0, auth.token, 1000);
        var dom_notice = getDomById('notice-main');
        feed.then(respo => {
            switch (respo.status) {
                case 200:
                    return Promise.resolve(respo.json());
                    break;
                case 403:
                    return Promise.reject();
                    break;
            }
        }).then(json => {
            // console.dir(json)
            let oldStr = old.join(',')
            let s2 = new Date().getTime();

            for (var i = 0; i < json.posts.length; i++) {
                let item = json.posts[i];
                var time = toDate(item.meta.published);
                var s1 = time.getTime();
                var total = (s2 - s1) / 1000;//Seconds 
                if (asd.indexOf(item.id) == -1 && total <= 1800 && oldStr.indexOf(item.id) == -1)//No messages on the page added within 30 minutes
                {
                    console.dir(item.id)
                    old.push(item.id)
                    dom_notice.innerHTML += '<div data-id="' + item.id + '" id="dom_notice_' + item.id + '"  class="alert dom_notice_class alert-info "> <strong>' + item.meta.author + '</strong>发表了新的post </div>'
                    setTimeout(function () {
                        var no = getDomById("dom_notice_" + item.id)
                        no.parentNode.removeChild(no);
                    }, 10000);
                }
            }
        })



    }

}, 5000)



//polling-------------------------------------


// scroll -------------------------------------
//Waterfall flow Monitors the window scroll event and determines the data to be loaded when the scroll distance is at a certain distance from the bottom.
//Get the height of the page browser viewport
function windowHeight() {
    //document.compatMode has two values. BackCompat: Standard compatibility mode is off. CSS1Compat: Standard compatibility mode is on.
    return (document.compatMode == "CSS1Compat") ?
        document.documentElement.clientHeight :
        document.body.clientHeight;
}

window.onscroll = function () {

    var documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    let scrollTop = Math.max(
        //chrome
        document.body.scrollTop,
        //firefox/IE
        document.documentElement.scrollTop);
    if (scrollTop + windowHeight() >= (documentHeight - 100/*The height of the scroll response area is 50px*/)) {
        if (!isGetFeed)
            getFeed();
    }


}
//scroll -------------------------------------

//routing
window.onhashchange = function () {
    var hashStr = location.hash.replace("#", "");
    try {
        if(hashStr.indexOf('profile')!=-1)
        {
           var username= hashStr.split('=')[1];
           if(username)
           {
            $("#userinfo-modal").modal('hide');
            userInfo(username)
           }
        }
        
    } catch (error) {
        console.dir(error);
    }
}
//





//const login=api.getLoginInfo('test','123456');

// login.then(rsult=>{
//     console.dir(rsult)
// })

//we can use this single api request multiple times
// const feed = api.getFeed();


// feed
// .then(posts => {
//    posts.reduce((parent, post) => {

//        parent.appendChild(createPostTile(post));

//        return parent;

//    }, document.getElementById('large-feed'))
// });

// //Potential example to upload an image
// const input = document.querySelector('input[type="file"]');

// input.addEventListener('change', uploadImage);


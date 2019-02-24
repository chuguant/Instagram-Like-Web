// change this when you integrate with the real API, or when u start using the dev server
const API_static_URL = 'http://localhost:8080/data'
const API_URL = 'http://localhost:5000'


const getJSON = (path, options) =>  
        fetch(path, options)
         //.then(res => res.json())
         //.catch(err => console.warn(`API_ERROR: ${err.message}`));




/**
 * This is a sample class API which you may base your code on.
 * You don't have to do this as a class.
 */
export default class API {

    /**
     * Defaults to teh API URL
     * @param {string} url 
     */
    constructor(url = API_URL) {
        this.url = url;
    } 
    getHeaders(token){
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        if(token)
        myHeaders.append('Authorization',token);
        
        return myHeaders;
    }

    makeAPIRequest(path, options) {
        return getJSON(`${this.url}/${path}`, options);
    }

    //auth api---------------------
    loginApi(userName,pwd){
        var myInit = { 
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({username: userName, password: pwd})
        };

        return this.makeAPIRequest('auth/login',myInit);
    }

    signupApi(username, password, email, name)
    {
        var myInit = { 
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({username: username, password: password, email: email, name: name})
            };
    
            return this.makeAPIRequest('auth/signup',myInit);
    }

    //auth api---------------------

    //user api---------------------
    getUser(token,username){
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);
        var myInit = { 
            method: 'GET',
            headers:myHeaders
            };
            return this.makeAPIRequest('user/?username='+username,myInit);
    }
    getUserById(token,id){
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);
        var myInit = { 
            method: 'GET',
            headers:myHeaders
            };
            return this.makeAPIRequest('user/?id='+id,myInit);
    }
    
    getFeed(pageIndex,token,n)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);
        var myInit = { 
            method: 'GET',
            headers:myHeaders
            };
            return this.makeAPIRequest('user/feed/?n='+n+'&p='+pageIndex,myInit);
    }

    putUser(token,name,email,password)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify({name: name, email: email, password: password})
            };
    
            return this.makeAPIRequest('user',myInit);
    }

    followUser(token,username)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'PUT',
            headers: myHeaders
            };
    
            return this.makeAPIRequest('user/follow?username='+username,myInit);
    }
    unFollowUser(token,username)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'PUT',
            headers: myHeaders
            };
    
            return this.makeAPIRequest('user/unfollow?username='+username,myInit);
    }


    //user api---------------------

    //post api---------------------

    postLike(token,id)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'PUT',
            headers: myHeaders
            };
    
            return this.makeAPIRequest('post/like?id='+id,myInit);
    }
    postUnLike(token,id)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'PUT',
            headers: myHeaders
            };
    
            return this.makeAPIRequest('post/unlike?id='+id,myInit);
    }

    postCreate(token,description_text,src)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify({description_text: description_text, src: src})
            };
    
            return this.makeAPIRequest('post',myInit);
    }

    postComment(token,author,published,comment,id)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify({author: author, published: published, comment: comment})
            };
    
            return this.makeAPIRequest('post/comment?id='+id,myInit);
    }

    getPost(token,id)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'GET',
            headers: myHeaders
            };
    
            return this.makeAPIRequest('post?id='+id,myInit);
    }

    deletePost(token,id)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'DELETE',
            headers: myHeaders
            };
    
            return this.makeAPIRequest('post?id='+id,myInit);
    }

    putPost(token,description_text,src,id)
    {
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('accept', 'application/json');
        myHeaders.append('Authorization',`Bearer ${token}`);

        var myInit = { 
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify({description_text: description_text, src: src})
            };
    
            return this.makeAPIRequest('post?id='+id,myInit);
    }


    //post api---------------------






    /**
     * @returns feed array in json format
     */
    // getFeed() {
    //     return this.makeAPIRequest('feed.json');
    // }


    /**
     * @returns auth'd user in json format
     */
    // getMe() {
    //     return this.makeAPIRequest('me.json');
    // }

}

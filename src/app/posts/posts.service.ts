import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Post } from "./post.model";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

// const BACKEND_URL = "http://localhost:3000/api/posts/";
const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({
    providedIn:'root'
})
export class PostsService{
    private posts:Post[]=[];
    // using observable
    private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

    constructor(private http: HttpClient, private router: Router){}

    // getPosts() {
    //     // for using eventemitter (or) for using observable
    //     // return [...this.posts];

    //     // using posts service
    //     // return this.posts;

    //     // using http to get posts from server(backend)
    //     this.http.get<{message: string, posts: Post[]}>('http://localhost:3000/api/posts')
    //     // for assigning mongodb objectid(_id) value to Post interface _id
    //     .pipe(map((postData) => {
    //         return postData.posts.map(post => {
    //             return {
    //                 title: post.title,
    //                 content: post.content,
    //                 _id: post._id
    //             };
    //         });
    //     }))
    //     // before creating a Post model using mongoose
    //     // .subscribe((postData) => {
    //         // this.posts = postData.posts;
    //         // this.postsUpdated.next([...this.posts]);

    //     // after creating a Post model using mongoose
    //     .subscribe(transformedPosts => {
    //         // console.log('transformedPosts are',transformedPosts);
    //         this.posts = transformedPosts;
    //         this.postsUpdated.next([...this.posts]);
    //     });
    // }

    // using reactive form
    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: Post[], maxPosts: number}>(BACKEND_URL + queryParams)
        .pipe(map((postData) => {
            return {posts: postData.posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,
                    imagePath: post.imagePath,
                    _id: post._id,
                    creator: post.creator
                };
            }), maxPosts: postData.maxPosts};
        }))
        .subscribe(transformedPostData => {
            console.log('transformedPosts are',transformedPostData);
            this.posts = transformedPostData.posts;
            this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts});
        });
    }

    // using observable
    getPostUpdateListener(){
        return this.postsUpdated.asObservable();
    }

    // getPost(id: string){
    //     // return {...this.posts.find(p => p._id === id)};
    //     return this.http.get<{_id: string, title: string, content: string}>("http://localhost:3000/api/posts/" + id);
    // }

    // using reactive form
    getPost(id: string){
        // return {...this.posts.find(p => p._id === id)};
        return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(BACKEND_URL + id);
    }

    // addPost(title:string, content:string){
    //     const post:Post = {_id: '', title: title, content: content};
    //     this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
    //     .subscribe((responseData) => {
    //         const id = responseData.postId;
    //         post._id = id;
    //         this.posts.push(post);
    //         // using observable
    //         this.postsUpdated.next([...this.posts]);
    //         this.router.navigate(["/"]);
    //     });
    // }

    // using reactive form
    addPost(title:string, content:string, image: File){
        const postData = new FormData();
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);
        this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
        .subscribe((responseData) => {
            this.router.navigate(["/"]);
        });
    }
    
    // updatePost(id: string, title: string, content: string){
    //     const post: Post = {_id: id, title: title, content: content};
    //     this.http.put("http://localhost:3000/api/posts/" + id, post)
    //     .subscribe(response => {
    //         const updatedPosts = [...this.posts];
    //         const oldPostIndex = updatedPosts.findIndex(p => p._id === post._id);
    //         updatedPosts[oldPostIndex] = post;
    //         this.posts = updatedPosts;
    //         this.postsUpdated.next([...this.posts]);
    //         this.router.navigate(["/"]);
    //     });
    // }

    // using reactive form
    updatePost(id: string, title: string, content: string, image: File | string){
        let postData: Post | FormData;
        if(typeof(image) === 'object') {
            postData = new FormData();
            postData.append("_id", id);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title);
        }else {
            postData = {_id: id, title: title, content: content, imagePath: image, creator: ''};
        }
        this.http.put(BACKEND_URL + id, postData)
        .subscribe(response => {
            this.router.navigate(["/"]);
        });
    }
    
    deletePost(postId: string){
        return this.http.delete(BACKEND_URL + postId);
    }
}
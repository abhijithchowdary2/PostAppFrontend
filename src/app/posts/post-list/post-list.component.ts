import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy{
    // posts = [
    //     {title: 'First Post', content: 'This is the first post\'s content'},
    //     {title: 'Second Post', content: 'This is the second post\'s content'},
    //     {title: 'Third Post', content: 'This is the third post\'s content'}
    // ];

    // using eventemitter
    // @Input()
    // posts:Post[] = [];
    
    // using posts service
    posts:Post[] = [];
    isLoading:boolean = false;
    totalPosts:number = 0;
    postsPerPage:number = 2;
    currentPage:number = 1;
    pageSizeOptions = [1, 2, 5, 10];
    // subscription: we use subscription for preventing memory leaks from the component in our application
    userIsAuthenticated:boolean = false;
    userId!: string;
    private postsSub:Subscription | undefined;
    private authStatusSub!: Subscription;

    constructor(public postsService: PostsService, private authService: AuthService){}
    ngOnInit() {
        // this.posts = this.postsService.getPosts();
        
        // using http to get posts from server(backend)
        this.isLoading = true;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.userId = this.authService.getUserId();
        this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData: {posts: Post[], postCount: number}) => {
          this.isLoading = false;
          this.totalPosts = postData.postCount;
          this.posts = postData.posts;
        });
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authStatusSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          this.userId = this.authService.getUserId();
        });
    }

    onChangedPage(pageData: PageEvent){
      this.isLoading = true;
      this.currentPage = pageData.pageIndex + 1;
      this.postsPerPage = pageData.pageSize;
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }

    ngOnDestroy() {
        console.log('unsubscribed from PostListComponent component!');
        this.postsSub?.unsubscribe();
        this.authStatusSub.unsubscribe();
    }

    onDelete(postId: string){
      this.isLoading = true;
      this.postsService.deletePost(postId).subscribe(() => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      }, () => {
        this.isLoading = false;
      });
    }
}
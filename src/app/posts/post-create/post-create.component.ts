import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Post } from '../post.model';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
    enteredTitle = '';
    enteredContent = '';
    post!:Post;
    isLoading:boolean = false;
    form!:FormGroup;
    imagePreview!:any;
    private mode = 'create';
    private postId:any;
    private authStatusSub!: Subscription;
    // using eventemitter
    // @Output()
    // postCreated = new EventEmitter<Post>();

    enteredValue = '';
    newPost = 'NO CONTENT';
    constructor(
      public postsService:PostsService,
      public route: ActivatedRoute,
      private authService: AuthService
    ){}

    // Using template reference variable
    // onAddPost(postInput:HTMLTextAreaElement){
    //     // console.log(postInput.value);
    //     // this.newPost = 'The user\'s post';
    //     this.newPost = postInput.value;
    // }

    // Using two way data binding
    // onAddPost(){
    //     this.newPost = this.enteredValue;
    // }

    // onAddPost(){
    //   const post:Post = {title: this.enteredTitle, content: this.enteredContent};
    //   this.postCreated.emit(post);
    // }

    ngOnInit() {
      this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
        authStatus => {
          this.isLoading = false;
        }
      );
      this.form = new FormGroup({
        title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
        content: new FormControl(null, {validators: [Validators.required]}),
        image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
      });
      this.route.paramMap.subscribe((paramMap: ParamMap) => {
          if(paramMap.has('postId')){
            this.mode = 'edit';
            this.postId = paramMap.get('postId');
            this.isLoading = true;
            this.postsService.getPost(this.postId).subscribe(postData => {
              this.isLoading = false;
              // this.post = {_id: postData._id, title: postData.title, content: postData.content};
              // using reactive form
              this.post = {_id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath, creator: postData.creator};
              this.form.setValue({title: this.post.title, content: this.post.content, image: this.post.imagePath});
            });
          }else{
            this.mode = 'create';
            this.postId = null;
          }
        });
    }

    // using ngForm and ngModel
    // onSavePost(form:NgForm){
    //   if(form.invalid){
    //     return;
    //   }
    //   this.isLoading = true;
    //   if(this.mode === 'create'){
    //     // using service
    //     this.postsService.addPost(form.value.title, form.value.content);
    //   }else{
    //     this.postsService.updatePost(this.postId, form.value.title, form.value.content);
    //   }
    //   // using eventemitter
    //   // const post:Post = {title: form.value.title, content: form.value.content};
    //   // this.postCreated.emit(post);
      
    //   form.resetForm();
    // }

    // using reactive form
    onSavePost(){
      if(this.form.invalid){
        return;
      }
      this.isLoading = true;
      if(this.mode === 'create'){
        this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
      }else{
        this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
      }
      this.form.reset();
    }

    onImagePicked(event: Event){
        const file:any = (event.target as HTMLInputElement).files?.item(0);
        this.form.patchValue({image: file});
        this.form.get('image')?.updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(file);
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}

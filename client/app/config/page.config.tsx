export const PAGES = new class PageConfig{
    HOME(){
        return "/"
    }
    LOGIN(){
        return "/authorization/login"
    }
    REGISTER(){
        return "/authorization/register"
    }
    MY_PROFILE(){
        return "/profile/my"
    }
    VIEW_PROFILE(id: number){
        return `/profile/${id}`
    }
    MY_POST(){
        return "/my/post/list/"
    }
    VIEW_POST(id: number){
        return `/post/view/${id}`
    }
}
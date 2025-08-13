import { PAGES } from "@/app/config/page.config";
import { ICartComment } from "@/app/shared/types/cartcomment.interface";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from 'next/navigation'

interface Props{
    comment: ICartComment
}

export function CartComment({comment}: Props){
  const router = useRouter();
  const date_create = format(comment.created_at, 'dd MMMM yyyy HH:mm:ss', {locale: ru});

  return(
    <div className="comment-list">
      <div className="comment-item">
        <div className="comment-header">
          <Link href={PAGES.VIEW_PROFILE(comment.owner_id)} prefetch={false} onClick={(e) => { e.preventDefault(); router.push(PAGES.VIEW_PROFILE(comment.owner_id), { scroll: false }); }} className="comment-author">{comment.owner}</Link>
          <span className="comment-date">{date_create}</span>
        </div>
        <div className="comment-text">
          {comment.content}
        </div>
      </div>
    </div>
  )
}
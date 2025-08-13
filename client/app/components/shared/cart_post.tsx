import { PAGES } from "@/app/config/page.config";
import { ICartPost } from "@/app/shared/types/cartpost.interface";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ru } from 'date-fns/locale';

interface Props{
  post: ICartPost
}

export function CartPost({post}: Props){
  const date_create = format(post.created_at, 'dd MMMM yyyy HH:mm:ss', {locale: ru});

  return(
    <li className="activity-item">
      <Link href={PAGES.VIEW_POST(post.id)}>{post.title}</Link>
        {post.isDecided && (
          <Image width={20} height={20} src={post.image} alt="check" />
        ) || null}
      <div className="activity-date">
        {date_create}
      </div>
    </li>
  )
}
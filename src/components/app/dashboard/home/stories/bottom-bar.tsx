import type {
  GetUserDetailsType,
  GetUserDetailsVariablesType,
} from '@/app/[locale]/(app)/profile/[id]/_interface';
import { GET_USER } from '@/app/[locale]/(app)/profile/[id]/_query';
import { Button, Icon, Input } from '@/components/ui';
import { PostDialog } from '@/components/app/common/post-card/post-modal';
import type { User, UserInfo } from '@/lib/definitions';
import { useMutation, useQuery } from '@apollo/client/react';
import { type SetStateAction, useState } from 'react';
import Image from 'next/image';

// emojis
import ehh from '../../../../../../public/images/emojis/ehh.gif';
import lovely from '../../../../../../public/images/emojis/lovely.gif';
import laugh from '../../../../../../public/images/emojis/laugh.gif';
import heart from '../../../../../../public/images/emojis/heart.gif';
import party from '../../../../../../public/images/emojis/party.gif';
import { SendMessage } from './_query';

import { type MessageInput } from './_interface';
import { Loader } from 'lucide-react';

export const StoryBottomBar = ({
  me,
  userInfo,
  storyUserId,
  currentStoryViews,
  onLikeStory,
  setPause,
  likes = [],
}: {
  me: boolean;
  userInfo: UserInfo;
  storyUserId: string;
  currentStoryViews: string[];
  onLikeStory: (emoji: string) => void;
  setPause: React.Dispatch<SetStateAction<boolean>>;
  likes?: { user_id: string; reaction: string }[];
}) => {
  const [open, setOpen] = useState<{ title: string; data: string[] }>({
    title: '',
    data: [],
  });
  const [input, setInput] = useState<string>('');
  const [replyStory, replyState] = useMutation<MessageInput>(SendMessage);
  const userReaction =
    likes?.find((like) => like.user_id === userInfo?.userid)?.reaction || '';
  const [selected, setSelected] = useState<string>(userReaction);
  const { data } = useQuery<GetUserDetailsType, GetUserDetailsVariablesType>(
    GET_USER,
    {
      variables: { userId: currentStoryViews?.[0] },
      skip: !currentStoryViews?.length,
    }
  );
  const viewList = (data?.getUser || []) as User[];

  const handleSend = async () => {
    try {
      setPause(true);
      await replyStory({
        variables: {
          messageInput: {
            message: input,
            message_to: storyUserId,
            sender_thread_type: 'FRIEND',
            thread_type: 'FRIEND',
            userInfo,
            message_type: 'TEXT',
          },
        },
      });
    } catch (error) {
      console.log('send error: ', error);
      setPause(true);
    } finally {
      setInput('');
      setPause(false);
    }
  };
  const emojis = [
    { r: '❤️', u: heart },
    { r: '😍', u: lovely },
    { r: '😂', u: laugh },
    { r: '🥳', u: party },
    { r: '😣', u: ehh },
  ];

  return (
    <>
      <div className="absolute bottom-3 left-3 right-3 z-40">
        {!me ? (
          <div className="relative">
            {/* Reply input — commented out for now, will be used later */}
            {/* <div className="pr-14">
              <Input
                className="w-full rounded-full h-10 text-sm text-white bg-black/50 placeholder:text-white/60 border-white/30"
                value={input}
                onInput={(e) => setInput(e.currentTarget.value)}
                placeholder="Reply..."
                onFocus={() => setPause(true)}
              />
            </div> */}
            <div className="absolute right-0 bottom-0 flex flex-col items-center gap-2">
              <div className="flex flex-col items-center gap-2 mb-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji.r}
                    onClick={() => {
                      setSelected(emoji.r);
                      onLikeStory(emoji.r);
                    }}
                    className={`text-3xl transition-transform duration-300 ${selected === emoji.r ? 'bg-background/20 p-1.5 rounded-full border border-background/40' : ''} hover:animate-[dance_3s_ease-in-out_infinite] `}
                  >
                    <Image src={emoji.u.src} className="size-8" alt={emoji.r} width={32} height={32} />
                  </button>
                ))}
              </div>
              {/* Send button — commented out for now, will be used later */}
              {/* <Button
                size="icon"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30"
                title="Send"
                disabled={replyState.loading}
                onClick={handleSend}
              >
                {replyState.loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Icon name="send" color="#fff" size={18} />
                )}
              </Button> */}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => {
                setPause(true);
                setOpen({ title: 'Story Views', data: currentStoryViews });
              }}
              className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 cursor-pointer transition-all duration-200 hover:bg-black/55 hover:border-white/20 active:scale-95"
            >
              <Icon name="eye" size={16} className="text-white/80 group-hover:text-white transition-colors" />
              {currentStoryViews?.length > 0 ? (
                <>
                  <div className="flex -space-x-1.5">
                    {viewList[0]?.photo_profile && (
                      <Image
                        alt=""
                        src={viewList[0].photo_profile}
                        width={22}
                        height={22}
                        className="size-5.5 rounded-full ring-[1.5px] ring-black/40 object-cover"
                      />
                    )}
                    {currentStoryViews.length > 1 && (
                      <div className="size-5.5 flex items-center justify-center rounded-full bg-white/20 ring-[1.5px] ring-black/40 text-[10px] font-medium text-white">
                        +{currentStoryViews.length - 1}
                      </div>
                    )}
                  </div>
                  <span className="text-white/90 text-xs font-medium">
                    {currentStoryViews.length} {currentStoryViews.length === 1 ? 'view' : 'views'}
                  </span>
                </>
              ) : (
                <span className="text-white/60 text-xs font-medium">No views yet</span>
              )}
            </button>
          </div>
        )}
      </div>{' '}
      {/* Pass likes here */}{' '}
      <PostDialog
        data={open}
        open={!!open?.data?.length}
        setOpen={(val) => {
          setOpen(val);
          const resolved = typeof val === 'function' ? val(open) : val;
          if (!resolved?.data?.length) setPause(false);
        }}
        likes={likes}
        noOverlay
      />{' '}
    </>
  );
};

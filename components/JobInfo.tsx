import type { ReactNode } from 'react';

function JobInfo({ icon, text }: { icon: ReactNode; text: ReactNode }) {
  return (
    <div className='flex gap-x-2 items-center'>
      {icon}
      {text}
    </div>
  );
}
export default JobInfo;

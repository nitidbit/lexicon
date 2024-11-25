import React, {ElementType, ReactNode} from 'react'

interface LxTagProps {
  tagName?: ElementType; // Allows HTML tags or React components
  children?: ReactNode;
}

export const LxTag: React.FC<LxTagProps> = ({tagName: Tag = 'span', children}) => {
  return(
    <Tag className="LxTag">
      {children}
    </Tag>
  )
}

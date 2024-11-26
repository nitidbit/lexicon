import React, {ElementType } from 'react'
import { Lexicon } from './Lexicon'

interface LxTagProps {
  tagName?: ElementType; // Allows HTML tags or React components
  lexicon: Lexicon;
  keyPath: string;
  vars?: object;
}

export const LxTag: React.FC<LxTagProps> = ({tagName: Tag = 'span', lexicon, keyPath, vars={}, ...otherProps}) => {
  const text = lexicon.get(keyPath, vars)
  const clickToEdit = lexicon.clicked(keyPath)
  return(
    <Tag className="LxTag" {...clickToEdit} {...otherProps}>
      { text }
    </Tag>
  )
}

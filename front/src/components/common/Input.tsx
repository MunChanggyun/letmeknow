import React from 'react'

type PropsType = {
    type: string,
    placeHolder: string,
    value?: string,
    onChange?: (e: React.FormEvent<HTMLInputElement>) => void
}

const Input: React.FC<PropsType> = (props: PropsType) => {
    return( 
        <>
            <input onChange={props.onChange} type={props.type} placeholder={props.placeHolder}/>
        </>
    )
}

export default Input
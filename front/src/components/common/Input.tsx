import React, { FormEvent } from 'react'

type PropsType = {
    type: string,
    placeHolder: string,
    value?: string,
    onChange?: (e: React.FormEvent<HTMLInputElement>) => void
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const Input: React.FC<PropsType> = (props: PropsType) => {
    return( 
        <>
            <input 
                onChange={props.onChange} 
                onKeyPress={props.onKeyPress}
                type={props.type} 
                placeholder={props.placeHolder}/>
        </>
    )
}

export default Input
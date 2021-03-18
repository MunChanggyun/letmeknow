import React from 'react'
import "../../sass/common.scss"

type Props = {
    children?: JSX.Element | string,
    classes?: string,
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

// const Button: React.FC<Props> = (props: Props) => {
const Button: React.FC<Props> = ({children, classes, onClick}: Props) => {
    return (
        <>  
            <button className={classes} onClick={onClick}>{children}</button>
        </>
    );
}

export default Button;
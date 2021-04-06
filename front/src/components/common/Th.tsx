import React from 'react'

type Props = {
    children?: JSX.Element | string
}

const Th:React.FC<Props> = ({children}: Props ) => {
    return (<th>{children}</th>)
}

export default Th
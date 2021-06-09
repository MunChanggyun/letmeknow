import React from 'react'
import {FinanceDataType} from '../../types/FinanceType'

type Props = {
    children: JSX.Element | string,
    className?: string
}

const Td:React.FC<Props> = ({children, className}: Props) => {
    return (
        <td  className={`rowStyle ${className && className}`}>
            {children}
        </td>
    )
}

export default Td
import React from 'react'
import {FinanceDataType} from '../../types/FinanceType'

type Props = {
    children: JSX.Element | string
}

const Td:React.FC<Props> = ({children}: Props) => {
    return (
        <td  className="rowStyle">
            {children}
        </td>
    )
}

export default Td
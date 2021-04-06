import React from 'react'
import Th from './Th'
import Td from './Td'
import {FinanceType} from '../../types/FinanceType'

type trProps = {
    trRow: FinanceType,
    tagType: string
}

const Tr:React.FC<trProps> = ({trRow, tagType}: trProps) => {
    return (
        <tr>
            {tagType === "head" ? (
                // trRow && <Th>{trRow.account_nm}</Th>
                trRow && 
                    <>
                        <Th></Th>
                        {(trRow.data || []).map((row:any, index: number) => (
                            <Th key={index} >{row.name}</Th>
                        ))}
                    </>
            )
            : (
                trRow && 
                    <>
                        <Td>{trRow.account_nm}</Td>
                        {(trRow.data || []).map((row:any, index: number) => (
                            <Td key={index} >{row.amount}</Td>
                        ))}
                    </>
            )}
        </tr>
    )
}

export default Tr
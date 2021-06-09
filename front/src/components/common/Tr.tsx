import React from 'react'
import Th from './Th'
import Td from './Td'
import {FinanceType, FinanceInfoType} from '../../types/FinanceType'

type trProps = {
    trRow?: FinanceType,
    trInfo?: FinanceInfoType[],
    tagType: string
}

const Tr:React.FC<trProps> = ({trRow, trInfo, tagType}: trProps) => {
    /**
     * <></> 에서 배열로 처리할 시 key 값을 설정할 수 없어서
     * React.Fragment 를 명시하여 key 값을 설정한다.
     */

   return (
        <tr className={'rowStyle ' + (trRow ? "seven": "four")}>
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
                (trInfo || []).length > 0 ? 
                    (trInfo && (trInfo || []).map((row: any, index: number) => (
                        <React.Fragment key={row._id}>  
                            <Td className="title">{row.key}</Td>
                            <Td>{row.value}</Td>
                        </React.Fragment>))): 
                    (trRow &&
                        <>
                            <Td>{trRow.account_nm}</Td>
                            {(trRow.data || []).map((row:any, index: number) => (
                                <Td key={index} >{row.amount}</Td>
                            ))}
                        </>)
            )}
            
        </tr>
    )
}

export default Tr
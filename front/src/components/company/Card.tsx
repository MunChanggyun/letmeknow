import React from 'react'
import cloud from '../../images/png/png_line_download.png';

type Props = {
    key: number,
    companyName: string,
    companyCode: string,
    onClick?: (e:React.MouseEvent<HTMLLIElement>) => void
}

const Card: React.FC<Props> = ({companyName, companyCode, onClick}: Props) => {
    return (
        <>
            <li onClick={onClick}>
                <div>
                    <p className="keyword" style={{lineHeight:'75px', fontWeight: 'bold', color:'#FF4000', fontSize:'20px'}}>
                        <span>{companyName}</span>
                    </p>
                    <p className="keyword">
                        <span>{companyCode}</span>
                    </p>
                </div>
                <div>
                    <p className="img">
                        <img src={cloud} alt="" />
                    </p>
                    <p className="keyword">
                        <span>재무제표 검색</span>
                    </p>
                </div>
            </li>
        </>
    )
}

export default Card
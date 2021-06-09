import axios from 'axios'

const getHtml = async (stockCode: string) => {
    try {
        console.log("stockCode", stockCode);
        return await axios.get(`https://comp.fnguide.com/SVO2/ASP/SVD_Main.asp?pGB=1&gicode=A${stockCode}&cID=&MenuYn=Y&ReportGB=&NewMenuID=11&stkGb=701`)
    }
    catch (e) {
        console.log(e.message);
    }
}

export default getHtml
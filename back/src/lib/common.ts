export const getDateYYYYMMDD = (addDate: number, addType:string, oriDate:Date) => {
    const year = addType === "Y" ? oriDate.getFullYear() + addDate : oriDate.getFullYear();
    const month = addType === "M" ? oriDate.getMonth() + 1 + addDate : oriDate.getMonth() + 1;
    const day = addType === "M" ? oriDate.getDay() + addDate : oriDate.getDay();

    const returnDate = year + "" + (month < 10 ? "0" + month : month) + "" + (day < 10 ? "0" + day : day)

    return returnDate;
}
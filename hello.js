function printNum(num) {
    let listOfNum = " "
    const arrayOfNum = [];
    for(let i = 1; i <= num; i++) {
        listOfNum += i + " ";
        arrayOfNum.push([i]);
    }
    return [listOfNum, arrayOfNum];
}
console.log(printNum(10))
const data = {
    data:{
        name:'1111111111111'
    }
}
const inc = function(name,sendData) {
    return require(`@/components/${name}.ejs`)(sendData?{data:data.data}: null)
}

module.exports = inc;
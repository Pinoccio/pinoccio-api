module.exports = json;

function json(l){
  try{
    return JSON.parse(l)
  } catch(e) {}
}

module.exports.s = function(l){
  try{
    return JSON.stringify(l)
  } catch(e) {}
}


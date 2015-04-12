
module.exports = function(){
  return function(r,cb){
    // generic. responds to commands the same way no matter the transport.
    cb(false,'hi');
  }
}

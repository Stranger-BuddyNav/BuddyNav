app.get('/transport',findTransportHandler);

function findTransportHandler(req,res){
  let transArray =[];
  let cityName = req.query.city;
  let transKey = '2e1ef13bdcmshd09c8bbd49d6542p11a6afjsn9dcddf83fd98';
  let hotelsURL =`https://hotels-com-provider.p.rapidapi.com/v1/destinations/search?locale=en_US&currency=USD&query=ammnan&rapidapi-key=${transKey}`;
  superagent.get(hotelsURL) //send request to weatherbit.io API
    .then(geoData => {
      console.log('inside superagent');
      // console.log(geoData);
      // let gData= geoData.body.searchResults.results;
      let gData= geoData.body.suggestions[3].entities;
      gData.map(val => {
        const newTrans = new Transport(val);
        transArray.push(newTrans);
      });
      res.send(transArray);
    })
    .catch(error => {
      console.log('inside superagent');
      console.log('Error in getting data from hotels server');
      console.error(error);
      res.send(error);
    });
  console.log('after superagent');
}

function Transport (transData){
  this.name = transData.name;
  this.type = transData.type;
}

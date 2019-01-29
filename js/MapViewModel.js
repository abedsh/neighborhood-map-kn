// hard coded marker locations
var defaultPlaces = [{
    "id": 1,
    "name": "Le Cinq",
    "latitude": 48.8688,
    "longitude": 2.30083
  },
  {
    "id": 2,
    "name": "Pierre gagnaire",
    "latitude": 48.87188099999999,
    "longitude": 2.3419189999999617
  },
  {
    "id": 3,
    "name": "Le Gabriel",
    "latitude": 48.8697628,
    "longitude": 2.3132848000000195
  },
  {
    "id": 4,
    "name": "Chez Michel",
    "latitude": 48.8795526,
    "longitude": 2.352264200000036
  },
  {
    "id": 5,
    "name": "Nana",
    "latitude": 48.856705,
    "longitude": 2.3720593000000463
  }
]

var map;
var infoWindow;

// initMap
function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {
      lat: 48.864716,
      lng: 2.349014
    },
    mapTypeControl: false
  });

  ko.applyBindings(new AppViewModel());

}

var AppViewModel = function() {
  var self = this;

// create and observemain markers list
  this.markers = ko.observableArray([]);

  // create and observe main search value
  this.searchValue = ko.observable("")

 //adds hardcoded markers the main markers list
  defaultPlaces.map((place) => {
    this.markers.push(new Marker(place))

  })



  //init info window
  infoWindow = new google.maps.InfoWindow({

  });


  //init places filterable list with a compute function that triggers on search value change
  self.filterableList = ko.computed(() => {
      var searchValue = this.searchValue().toLowerCase();
      if (this.searchValue().length ==0) { // if user removes text or on init, show all markers and list
          this.markers().map(marker=>marker.visible(true))
          return this.markers();
      } else { // filter list  by search text and update marker visibility accordingly
          return ko.utils.arrayFilter(this.markers(), marker => {
              var result = marker.name.toLowerCase().includes(searchValue)
              marker.visible(result);
              return result;
          });
      }
  }, self);


}

// class for marker
var Marker = function(place) {
  var self = this;
  // init fields
  self.id = place.id;
  self.name = place.name;
  self.position = {
    lat: place.latitude,
    lng: place.longitude
  };
  self.visible = ko.observable(true);


// create marker as a field
  self.marker = new google.maps.Marker({
    position: {
      lat: place.latitude,
      lng: place.longitude
    },
    map: map,
    title: place.name
  });

 // on visible change this function willbe called to to remove/add marker on map
  self.onMarkerVisbleChange = ko.computed(function () {
        self.marker.setMap(self.visible()?map:null);
  });



// add listener on marker to set an animation and open the info window on click
  this.marker.addListener('click', function() {

    if (this.getAnimation() != null) {
               this.setAnimation(null);
           } else {
               this.setAnimation(google.maps.Animation.BOUNCE);
               setTimeout(()=>this.setAnimation(null), 1000);

           }


    openInfowWindow(this)
    dispatchGetInfo(this.title,this.getPosition());

  });

 // adds on item click function to trigger a marker click
  this.onListItemClick = ()=>  {
    new google.maps.event.trigger(self.marker, 'click');
  };

}

// opens empty info window
function openInfowWindow(marker) {


  infoWindow.setContent("");

  infoWindow.open(map, marker);

}

// sets  info window content
function setInfoWindowContent(content) {


  var contentString = '<div id="content">' +
    '<div id="siteNotice">' +
    '</div>' +
    '<h1 id="firstHeading" class="firstHeading">' + content.name + '</h1>' +
    '<div >' +
    '<li>Phone: ' +(content.display_phone?content.display_phone:'n/a')+' </li>'+
    '<li>Price: ' +(content.price?content.price:'n/a')+' </li>'+
    '<li>Rating: ' +(content.rating?content.rating+'/5':'n/a')+' </li>'+



    '<p>Info provided by Yelp</p>' +
    '</div>' +
    '</div>';

     infoWindow.setContent(contentString);


}


// sends a request to the yelp api to get relevant info
function dispatchGetInfo(name, position) {
  // calls yelp api  with a cors-anywhere.herokuapp.com prefix to allow the call without a backend
  axios.get('https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search', {
      params: {
        term: name,
        latitude: position.lat(),
        longitude: position.lng()
      },
      headers: {
        Authorization: 'Bearer ' + 'i16a6V32crV2RbB2BHMrRvJ-5Vda_qneFBnZnJ8Vj9lorika9vB_DJRK_Fe' +
          'SAkNAfglNlacGh5Y1Rvnl712VwJRqc52HKuGSAjpu29TQW1h3jcZp7_ukspunoBM6XHYx'
      }
    })
    .then(function(response) {
      var markerInfo = response.data.businesses[0];
      // on successs, if received business is available send it to the store
      if (markerInfo) {
        setInfoWindowContent(markerInfo)
      } else { // on successs, if received business is not available return an error msg to the user

        alert("Could not contact info services")
      }



    })
    .catch(function(error) {
      console.log(error);
      // on http request error, display an error msg to the user
      alert("Could not contact info services")


    });









}







function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

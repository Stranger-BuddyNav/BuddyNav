/* eslint-disable no-undef */
'use strict';
console.log('js working');
$('#updateSection').hide();
$('#updateButton').on('click',function(){
  $('#updateSection').toggle();
});

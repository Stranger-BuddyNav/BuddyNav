/* eslint-disable no-undef */
'use strict';
console.log('js working');
$('.updateSection').hide();
$('#updateButton').on('click',function(){
  console.log('in on');
  $('.updateSection').toggle();
});
console.log('line 10');


function recordClickOnProduct(dataLayer, product) {
  dataLayer.push({
      'event': 'productClick',
      'ecommerce': {
        'click': {
          'actionField': {'list': 'Products Clicks'},      // Optional list property.
          'products': [{
            'name': product.name,                      // Name or ID is required.
            'id': product.id,
            'price': product.price,
            'currency': product.currency,
            'brand': product.brand,
            'category': product.cat,
            'variant': product.variant,
           }]
         }
       },
       'eventCallback': function() {
         document.location = product.url
       }
    });
}

function recordViewOnProductDetail(dataLayer, product){
  dataLayer.push({
    'ecommerce': {
      'detail': {
        'actionField': {'list': 'Product Detail'},    // 'detail' actions have an optional list property.
        'products': [{
          'name': product.name,         // Name or ID is required.
          'id': product.id,
          'brand': product.brand,
          'category': product.category,
         }]
         }
       }
    })
}

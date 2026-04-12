

~~~
 baseUrl(shop.com)
 |
 ├── signup
 |   ├────── [POST] client
 |
 ├── [POST] signin
 |
 |
 ├── [GET] signout
 |
 ├── products
 |   ├────── category
 |   |          ├────── [GET] list
 |   |          └────── [GET] ?query Pattern : http://host/products/category/?category=food+drinks&subCategory=bio+healthy&currentPage=1&...
 |   |
 |   ├────── [GET] bestsellers
 |   ├────── [GET] hotdeals
 |   ├────── [GET] popular
 |   ├────── [GET] :productid
 |   ├────── semilars
 |   |          └────── [GET] :productid 
 |   |
 |   ├────── [PUT] new
 |   ├────── changes
 |   |          └────── [PATCH] :category
 |   |
 |   └────── reviews
 |              ├────── [GET] :productid
 |              ├────── [PUT] :productid
 |              ├────── [PATCH] :productid
 |              └────── [DELETE] :productid
 |
 ├── myaccount
 |   ├────── [GET] /
 |   ├────── [PATCH] /
 |   ├────── [PATCH] changepassword
 |   ├────── cart
 |   |          ├────── [GET] /
 |   |          └────── [PATCH] /
 |   |
 |   └────── favorites
 |              ├────── [GET] /
 |              └────── [PATCH] /
 |
 ├── search [GET] ?query Pattern : http://host/search/?q=food+drinks&currentPage=1&...  
~~~

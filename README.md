# Just Food

Application to order menus using NodeJS. You have the hability to register as an user or a restaurant, ordering menus o publishing them, according to your user type.

## Entities

* User - Can place orders
    * Email
    * Password
    * Name and surname
    * Address
    * User type
    
* Restaurant - Can manage menus
    * Email
    * Password
    * Name of the restaurant
    * Food kind
    * Phone
    * Address
    * City
    * Province
    * User type
    * Pic/photo 

* Menus
    * Name
    * Dishes  
    * Price of the menu

* Orders
    User
    Restaurant
    Menu
    Date of the order

## Actions

Order a menu
Add a menu
Restaurant/user sign up


## Express modules

* https://www.npmjs.com/package/express-sanitizer
* https://www.npmjs.com/package/express-limiter

# Diseño y Programación de Interfaces de Usuario

## Entidades

* Usuario - Puede realizar pedidos
    * email
    * contraseña
    * Nombre y apellidos
    * Dirección
    * Tipo Usuario
    
* Restaurante - Puede dar de manejar menús
    * email
    * contraseña
    * Nombre
    * Tipo restaurante
    * Telefono
    * Dirección
    * Ciudad
    * Provincia
    * Tipo Usuario
    * Foto 

(USAR UNA SOLA ENTIDAD, LOS CAMPOS DE RESTAURANTE SERÍAN OPCIONALES)
 
* Menu
    * Nombre
    * Platos  
    * Precio

* Pedidos
    usuario
    restaurante
    menu
    fecha

## Acciones

Realizar Pedido
Añadir Menús
Alta restaurante/Usuario


## Flujo navegación

Acceso a la raiz --> redirección a la "tienda". SOLAMENTE UN USUARIO REGISTRADO PUEDE REALIZAR PEDIDOS

Registro --> Elección Registro Usuario/Restaurante
    Registro Usuario: Alta de usuarios
    Registro Restaurante: Alta restaurante
    
Login -->   Acceso como usuario nos redirige a la "tienda"
            Acceso como restaurante nos redirige al panel de administración del resutaurante (publicaciones)


##

Express modules:

* https://www.npmjs.com/package/express-sanitizer
* https://www.npmjs.com/package/express-limiter
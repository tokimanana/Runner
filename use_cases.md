graph TB
    subgraph System["Système de gestion TO"]
        
        subgraph Configuration["Module Configuration"]
            UC1[Gérer les hôtels]
            UC2[Gérer les Age Categories]
            UC3[Gérer les Room Types]
            UC4[Gérer les Meal Plans]
            UC5[Gérer les Markets & Currencies]
            UC6[Gérer les contrats tarifaires]
            UC7[Gérer les offres promotionnelles]
            UC8[Gérer les suppléments]
        end
        
        subgraph Reservation["Module Réservation"]
            UC9[Simuler une réservation]
            UC10[Sélectionner un hôtel]
            UC11[Choisir les chambres]
            UC12[Appliquer des offres]
            UC13[Ajouter des suppléments]
            UC14[Calculer le prix total]
            UC15[Consulter le breakdown détaillé]
        end
        
        subgraph Admin["Module Administration"]
            UC16[Gérer les utilisateurs]
            UC17[Consulter l'historique]
            UC18[Exporter les résultats]
        end
    end
    
    Admin[👤 Admin TO]
    Manager[👤 Manager TO]
    Agent[👤 Agent TO]
    
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC16
    
    Manager --> UC1
    Manager --> UC2
    Manager --> UC3
    Manager --> UC4
    Manager --> UC5
    Manager --> UC6
    Manager --> UC7
    Manager --> UC8
    Manager --> UC9
    Manager --> UC17
    Manager --> UC18
    
    Agent --> UC9
    Agent --> UC17
    
    UC9 --> UC10
    UC9 --> UC11
    UC9 --> UC12
    UC9 --> UC13
    UC9 --> UC14
    UC14 --> UC15
    
    UC6 -.->|extends| UC2
    UC11 -.->|requires| UC3
    UC12 -.->|requires| UC7
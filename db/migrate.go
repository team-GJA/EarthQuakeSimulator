package main

import (
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"github.com/team-GJA/EarthQuakeSimulator/models"
)

func main() {
	db, _ := gorm.Open("mysql", "root:@/earth_quake_sim")
	db.CreateTable(&models.User{})
}

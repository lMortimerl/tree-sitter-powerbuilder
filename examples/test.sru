string ls1, ls2, ls3
long ll3

ll3 = dw_z.getrow()
// wenn es keine termin-posten gibt: nicht weiter tun..
if ll3 < 1 then return

// erstmal so, man könnte aber auch die ddlb auswerten..
if dw_z.getitemString(ll3,"rbbau_mass") = "1" then ls1 = " JA " else ls1 = " NEIN "
// dieses feld soll aber nur für große maßnahmen angezeigt werden..
if iw_Mo_m.ist_sys.s_system <> "213" then  
    ls1 = ""
else
	ls1 = dw_z.object.st_hu_bau_delegiert.text + " : " + ls1 + "  "
end if

ls2 = string(dw_z.getitemDateTime(ll3,"c_standmdat"),"dd.mm.yyyy") 
if ls2 < " "  then ls2 = "          "

choose case dw_z.getitemString(ll3,"standm_mass")
	case "1"
		ls3 = "genehmigt"
	case "2"
		ls3 = "gestoppt"
	case "3"
		ls3 = "zurückgestellt"
	case "4"
		"s" = "aufgehoben"
	case else
		ls3 = "       "
end choose

label:

goto label

iw_mo_m.is_print_b = "{{LF10}}"  +  "Maßnahme am  : " + ls2  + "  Stand : " + ls3

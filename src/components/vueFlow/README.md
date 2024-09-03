{
    "code": 200,
    "success": true,
    "message": "请求成功",
    "data": {
        "nodes": [
            {
                "id": "3",
                "type": "idea",
                "data": {
                    "name": "斌",
                    "id": 3,
                    "bgc": "#FF7F3E"
                },
                "position": {
                    "x": 0,
                    "y": 0
                }
            },
            {
                "id": "2",
                "type": "group",
                "data": {
                    "groupName": "test_group2",
                    "groupConclusion": "新的观点是人工智能太太太太太太棒了!",
                    "bgc": "#FF7F3E",
                    "group_id": 4
                },
                "positon": {
                    "x": 0,
                    "y": 0
                }
            },
            {
                "id": "1",
                "type": "topic",
                "data": {
                    "text": "人工智能对于教育会产生哪些影响?"
                },
                "position": {
                    "x": 0,
                    "y": 0
                }
            }
        ],
        "edges": [
            {
                "id": "1",
                "source": "2",
                "target": "1",
                "_type": "group_to_discuss",
                "animated": false
            },
            {
                "id": "2",
                "source": "3",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "3",
                "source": "6",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "6",
                "source": "9",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "7",
                "source": "10",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "8",
                "source": "11",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "9",
                "source": "12",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "10",
                "source": "13",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "11",
                "source": "17",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "12",
                "source": "18",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "13",
                "source": "19",
                "target": "3",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "14",
                "source": "20",
                "target": "3",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "15",
                "source": "21",
                "target": "3",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "17",
                "source": "23",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "18",
                "source": "24",
                "target": "10",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "19",
                "source": "25",
                "target": "9",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "20",
                "source": "26",
                "target": "11",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "21",
                "source": "27",
                "target": "21",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "22",
                "source": "28",
                "target": "24",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "23",
                "source": "29",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "24",
                "source": "31",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "25",
                "source": "32",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "26",
                "source": "33",
                "target": "32",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "27",
                "source": "34",
                "target": "33",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "28",
                "source": "35",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "63",
                "source": "96",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "64",
                "source": "97",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "65",
                "source": "98",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "66",
                "source": "99",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "67",
                "source": "100",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "68",
                "source": "101",
                "target": "31",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "69",
                "source": "102",
                "target": "29",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "70",
                "source": "103",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "101",
                "source": "168",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "102",
                "source": "169",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "105",
                "source": "172",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "106",
                "source": "173",
                "target": "26",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "107",
                "source": "174",
                "target": "26",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "108",
                "source": "175",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "109",
                "source": "176",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "110",
                "source": "177",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "111",
                "source": "178",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "112",
                "source": "179",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "113",
                "source": "180",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "114",
                "source": "181",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "115",
                "source": "182",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "116",
                "source": "183",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "117",
                "source": "184",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "118",
                "source": "185",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "119",
                "source": "186",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "120",
                "source": "187",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "121",
                "source": "188",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "122",
                "source": "189",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "123",
                "source": "190",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "124",
                "source": "191",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "125",
                "source": "192",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "126",
                "source": "193",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "127",
                "source": "194",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "128",
                "source": "195",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "129",
                "source": "196",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "130",
                "source": "197",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "131",
                "source": "198",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "132",
                "source": "199",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "133",
                "source": "200",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "134",
                "source": "201",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "135",
                "source": "202",
                "target": "26",
                "_type": "reject",
                "animated": false
            },
            {
                "id": "136",
                "source": "203",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "137",
                "source": "204",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "138",
                "source": "205",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "139",
                "source": "206",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "140",
                "source": "207",
                "target": "6",
                "_type": "approve",
                "animated": false
            },
            {
                "id": "141",
                "source": "213",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "142",
                "source": "214",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "144",
                "source": "217",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            },
            {
                "id": "145",
                "source": "220",
                "target": "2",
                "_type": "idea_to_group",
                "animated": false
            }
        ]
    }
}
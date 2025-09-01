import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import React, { useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ProjectList from "../data/ProjectList";

const ProjectButtons = ({ Onchange }) => {
    const scrollRef = useRef(null);
    const itemRef = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0);
   
    const handleSelectProject = (index) => {
        const selected = itemRef.current[index];
        setActiveIndex(index);

        // selected?.measure((x) => {
        //     scrollRef.current?.scrollTo({ x: x, y: 0, animated: true });
        // });

        Onchange(ProjectList[index].projectId);
    };

    return (
        <View>
            {/* <Text className="font-bold text-black">Project Name</Text> */}
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    gap: 10,
                    paddingVertical: 10,
                    marginBottom: 10,
                }}
            >
                {ProjectList.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        ref={(el) => (itemRef.current[index] = el)}
                        onPress={() => handleSelectProject(index)}
                        className={`flex-row items-center px-4 py-2 rounded-lg shadow ${activeIndex === index
                                ? "bg-secondary"
                                : "bg-white"
                            }`}
                    >
                        {/* <MaterialCommunityIcons
                            name={item.iconName}
                            size={20}
                            color={activeIndex === index ? "#fff" : "black"}
                        /> */}
                        <Text
                            className={`ml-1 ${activeIndex === index ? "text-white" : "text-black"
                                }`}
                        >
                            {item.projectName}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default ProjectButtons;

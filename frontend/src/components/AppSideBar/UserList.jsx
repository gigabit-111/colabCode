const colors255 = [
    "#0000AA", "#00AA00", "#00AAAA", "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
    "#555555", "#5555FF", "#55FF55", "#55FFFF", "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF",
    "#1A1A1A", "#1A1AFF", "#1AFF1A", "#1AFFFF", "#FF1A1A", "#FF1AFF", "#FFFF1A", "#1A1AFF",
    "#333333", "#3333FF", "#33FF33", "#33FFFF", "#FF3333", "#FF33FF", "#FFFF33", "#3333FF",
    "#4D4D4D", "#4D4DFF", "#4DFF4D", "#4DFFFF", "#FF4D4D", "#FF4DFF", "#FFFF4D", "#4D4DFF",
    "#666666", "#6666FF", "#66FF66", "#66FFFF", "#FF6666", "#FF66FF", "#FFFF66", "#6666FF",
    "#808080", "#8080FF", "#80FF80", "#80FFFF", "#FF8080", "#FF80FF", "#FFFF80", "#8080FF",
    "#999999", "#9999FF", "#99FF99", "#99FFFF", "#FF9999", "#FF99FF", "#FFFF99", "#9999FF",
    "#B3B3B3", "#B3B3FF", "#B3FFB3", "#B3FFFF", "#FFB3B3", "#FFB3FF", "#FFFFB3", "#B3B3FF",
    "#CCCCCC", "#CCCCFF", "#CCFFCC", "#CCFFFF", "#FFCCCC", "#FFCCFF", "#FFFFCC", "#CCCCFF",
    "#E6E6E6", "#E6E6FF", "#E6FFE6", "#E6FFFF", "#FFE6E6", "#FFE6FF", "#FFFFE6", "#E6E6FF",
    "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#C0C0C0", "#808080",
    "#800000", "#808000", "#008000", "#800080", "#008080", "#000080", "#FF4500", "#DA70D6",
    "#EEE8AA", "#98FB98", "#AFEEEE", "#DB7093", "#FFD700", "#CD5C5C", "#F08080", "#20B2AA",
    "#87CEFA", "#778899", "#B0C4DE", "#FFFFE0", "#00FA9A", "#48D1CC", "#C71585", "#191970",
    "#F5FFFA", "#FFE4E1", "#FFE4B5", "#FFDEAD", "#000080", "#FDF5E6", "#808000", "#6B8E23",
    "#FFA500", "#FF4500", "#DA70D6", "#EEE8AA", "#98FB98", "#AFEEEE", "#DB7093", "#FFD700",
    "#CD5C5C", "#F08080", "#20B2AA", "#87CEFA", "#778899", "#B0C4DE", "#FFFFE0", "#00FA9A",
    "#48D1CC", "#C71585", "#191970", "#F5FFFA", "#FFE4E1", "#FFE4B5", "#FFDEAD", "#000080",
    "#FDF5E6", "#808000", "#6B8E23", "#FFA500", "#FF4500", "#DA70D6", "#EEE8AA", "#98FB98",
    "#AFEEEE", "#DB7093", "#FFD700", "#CD5C5C", "#F08080", "#20B2AA", "#87CEFA", "#778899",
    "#B0C4DE", "#FFFFE0", "#00FA9A", "#48D1CC", "#C71585", "#191970", "#F5FFFA", "#FFE4E1",
    "#FFE4B5", "#FFDEAD", "#000080", "#FDF5E6", "#808000", "#6B8E23", "#FFA500", "#FF4500",
    "#DA70D6", "#EEE8AA", "#98FB98", "#AFEEEE", "#DB7093", "#FFD700", "#CD5C5C", "#F08080",
    "#20B2AA", "#87CEFA", "#778899", "#B0C4DE", "#FFFFE0", "#00FA9A", "#48D1CC", "#C71585",
    "#191970", "#F5FFFA", "#FFE4E1", "#FFE4B5", "#FFDEAD", "#000080", "#FDF5E6", "#808000",
    "#6B8E23", "#FFA500", "#FF4500", "#DA70D6", "#EEE8AA", "#98FB98", "#AFEEEE", "#DB7093",
    "#FFD700", "#CD5C5C", "#F08080", "#20B2AA", "#87CEFA", "#778899", "#B0C4DE", "#FFFFE0",
    "#00FA9A", "#48D1CC", "#C71585", "#191970", "#F5FFFA", "#FFE4E1", "#FFE4B5", "#FFDEAD",
    "#000080", "#FDF5E6", "#808000", "#6B8E23", "#FFA500", "#FF4500", "#DA70D6", "#EEE8AA",
    "#98FB98", "#AFEEEE", "#DB7093", "#FFD700", "#CD5C5C", "#F08080", "#20B2AA", "#87CEFA",
    "#778899", "#B0C4DE", "#FFFFE0", "#00FA9A", "#48D1CC", "#C71585", "#191970", "#F5FFFA",
    "#FFE4E1", "#FFE4B5", "#FFDEAD", "#000080", "#FDF5E6", "#808000", "#6B8E23", "#FFA500"
];
function UserListComponent({ user, index, handleFullNameView }) {
    return (
        <div onClick={() => handleFullNameView(user)} className='p-2 rounded flex flex-col items-center justify-center gap-1 border border-gray-600 w-20 hover:bg-gray-800'>
            <div
                className="flex items-center justify-center w-5 h-5 rounded-full p-4"
                style={{ backgroundColor: colors255[index % 255] }}
            >
                <h3>{user[0].toUpperCase()}</h3>
            </div>
            <h3>{user.split(" ")[0]}</h3>
        </div>
    )
}

export default UserListComponent
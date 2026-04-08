// "use client";

// import { useContext } from "react";
// import { MenuContext } from "../context/MenuProvider";
// import { Toggle } from "@/app/_shadcn/components/ui/toggle";
// import { Menu, X } from "lucide-react";

// export default function MenuToggle() {
//     const { isOpen, setIsOpen } = useContext(MenuContext);

//     return (
//         <Toggle
//             size="icon"
//             pressed={isOpen}
//             onPressedChange={(value) => setIsOpen(value)}
//         >
//             {!isOpen && <Menu />}
//             {isOpen && <X />}
//         </Toggle>
//     );
// }

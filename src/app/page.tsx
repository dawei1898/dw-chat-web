import Image from "next/image";

export default function Home() {
  return (
    <div >
      <Image
          className="dark:invert"
          src="/dw-chat-logo.png"
          alt="dw chat logo"
          width={38}
          height={38}
          priority
      />
    </div>
  );
}

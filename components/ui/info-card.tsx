import React from "react";

// RTL detection for Hebrew/Arabic
function isRTL(text: string) {
  return /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F]/.test(text);
}

export interface InfoCardProps {
  image: string;
  title: string;
  description: string;
  badge?: string;
  tag?: string;
  width?: number | string;
  height?: number | string;
  borderColor?: string;
  borderBgColor?: string;
  borderWidth?: number;
  borderPadding?: number;
  cardBgColor?: string;
  shadowColor?: string;
  patternColor1?: string;
  patternColor2?: string;
  textColor?: string;
  hoverTextColor?: string;
  fontFamily?: string;
  rtlFontFamily?: string;
  effectBgColor?: string;
  contentPadding?: string;
  layout?: "vertical" | "horizontal";
}

export const InfoCard: React.FC<InfoCardProps> = ({
  image,
  title,
  description,
  badge,
  tag,
  width = "100%",
  height,
  borderColor = "#DAFF3E",
  borderBgColor = "#242424",
  borderWidth = 3,
  borderPadding = 14,
  cardBgColor = "#000",
  shadowColor = "#242424",
  patternColor1 = "rgba(230,230,230,0.15)",
  patternColor2 = "rgba(240,240,240,0.15)",
  textColor = "#f5f5f5",
  hoverTextColor = "#242424",
  fontFamily = "inherit",
  rtlFontFamily = "'Montserrat', sans-serif",
  effectBgColor = "#DAFF3E",
  contentPadding = "20px 24px",
  layout = "vertical",
}) => {
  const rtl = isRTL(title) || isRTL(description);
  const effectiveFont = rtl ? rtlFontFamily : fontFamily;
  const titleDirection = isRTL(title) ? "rtl" : "ltr";
  const descDirection = isRTL(description) ? "rtl" : "ltr";

  const pattern =
    `linear-gradient(45deg, ${patternColor1} 25%, transparent 25%, transparent 75%, ${patternColor2} 75%),` +
    `linear-gradient(-45deg, ${patternColor2} 25%, transparent 25%, transparent 75%, ${patternColor1} 75%)`;

  const isHorizontal = layout === "horizontal";

  return (
    <div
      className="group/card w-full relative z-20 pointer-events-auto rounded-[1em] cursor-pointer select-none transition-all duration-300"
      style={{
        width: "100%",
        maxWidth: typeof width === "number" ? `${width}px` : width,
        height: height ? height : isHorizontal ? "260px" : "378px",
        boxSizing: "border-box",
        fontFamily: effectiveFont,
      }}
    >
      {/* Idle Base Border Box */}
      <div
        className="absolute inset-0 rounded-[1em] pointer-events-none transition-opacity duration-300"
        style={{
          padding: borderPadding,
          border: `${borderWidth}px solid transparent`,
          borderRadius: "1em",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          backgroundImage: `linear-gradient(${cardBgColor}, ${cardBgColor}), linear-gradient(${borderBgColor}, ${borderBgColor})`,
          boxShadow: `0 4px 20px ${shadowColor}`,
        }}
      />

      {/* Active Hover Border Overlay (360-degree border + glow across full card) */}
      <div
        className="absolute inset-0 rounded-[1em] pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20"
        style={{
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: `0 0 35px ${borderColor}60, inset 0 0 15px ${borderColor}25`,
        }}
      />

      {/* Card Content Shell */}
      <div
        className="relative z-10 w-full h-full rounded-[1em] overflow-hidden flex"
        style={{
          margin: borderPadding,
          width: `calc(100% - ${borderPadding * 2}px)`,
          height: `calc(100% - ${borderPadding * 2}px)`,
          background: cardBgColor,
          flexDirection: isHorizontal ? "row" : "column",
          backgroundImage: pattern,
          backgroundSize: "20.84px 20.84px",
        }}
      >
        {/* Left Side: Image */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            width: isHorizontal ? "42%" : "100%",
            height: isHorizontal ? "100%" : "180px",
          }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-125 group-hover/card:brightness-110"
          />
        </div>

        {/* Right Side: Title & Description */}
        <div
          className="flex-grow flex flex-col min-h-0"
          style={{
            justifyContent: isHorizontal ? "center" : "space-between",
            padding: contentPadding,
            gap: isHorizontal ? "14px" : "8px",
          }}
        >
          {(badge || tag) && (
            <div className="flex items-center justify-between gap-2">
              {badge && (
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: borderColor }}
                >
                  {badge}
                </span>
              )}
              {tag && (
                <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/80">
                  {tag}
                </span>
              )}
            </div>
          )}

          <h1
            className="relative overflow-hidden w-fit font-bold tracking-tight mb-0 transition-colors duration-300 text-white group-hover/card:text-[var(--hover-text)]"
            style={{
              fontSize: isHorizontal ? 24 : 20,
              direction: titleDirection,
              ["--hover-text" as any]: hoverTextColor,
            }}
          >
            <span className="relative z-10 px-1.5 py-0.5 inline-block">
              {title}
            </span>
            <span
              className="absolute inset-0 z-0 transition-transform duration-400 ease-[cubic-bezier(.1,.5,.5,1)] origin-center scale-y-0 group-hover/card:scale-y-100"
              style={{ backgroundColor: effectBgColor }}
            />
          </h1>

          <p
            className="text-white/85 line-clamp-3 md:line-clamp-4 leading-relaxed mb-0 min-h-0"
            style={{
              fontSize: isHorizontal ? 14 : 13,
              direction: descDirection,
            }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

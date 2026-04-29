---
title: 'Hình Học của Cửa Sổ Ngữ Cảnh LLM'
description: 'Khám phá các ẩn dụ không gian chúng ta dùng để hiểu cơ chế attention và tại sao cửa sổ "vô hạn" là một ngộ nhận thiết kế.'
pubDate: 2026-04-23
category: 'Thiết Kế Hệ Thống'
tags: ['llm', 'ai', 'kiến trúc']
draft: false
locale: 'vi'
readingTime: 12
---

Khi nói về *ngữ cảnh* của một mô hình, chúng ta thường nghĩ đến ẩn dụ của một cửa sổ — một thứ gì đó được khung, hình chữ nhật, đo lường mức độ thế giới có thể được nắm bắt cùng lúc. Nhưng cửa sổ là hình học sai. Attention không phải một tấm kính; nó là một trường.

Trường này đặc ở những mép vừa chạm và loãng ở khoảng cách giữa. Nhân đôi kích thước cửa sổ không nhân đôi độ rõ; nó nhân đôi sương mù. Một ngữ cảnh dài hơn mà không có prior sắc nét hơn không phải là thêm trí nhớ — nó là thêm sương mù.

Thứ chúng ta cần là một *địa hình tư duy* — một hình dạng của ngữ cảnh mã hóa không chỉ những gì đã được nói, mà còn vị trí của nó trong ý định của người đọc. Vị trí là ý nghĩa, và token đầu tiên không phải suy nghĩ đầu tiên mà là cử chỉ đầu tiên.

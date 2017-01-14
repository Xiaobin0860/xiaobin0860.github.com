---
layout: post
title:  "分析block函数签名"
date:   2017-01-14
categories: ios reverse
---

##block结构

[Block](http://clang.llvm.org/docs/Block-ABI-Apple.html)

    struct Block_literal_1 {
        void *isa; // initialized to &_NSConcreteStackBlock or &_NSConcreteGlobalBlock
        int flags;
        int reserved;
        void (*invoke)(void *, ...);
        struct Block_descriptor_1 {
        unsigned long int reserved;         // NULL
            unsigned long int size;         // sizeof(struct Block_literal_1)
            // optional helper functions
            void (*copy_helper)(void *dst, void *src);     // IFF (1<<25)
            void (*dispose_helper)(void *src);             // IFF (1<<25)
            // required ABI.2010.3.16
            const char *signature;                         // IFF (1<<30)
        } *descriptor;
        // imported variables
    };

##函数签名

[Type Encodings](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html)


`[NSMethodSignature signatureWithObjCTypes:"v32@?0@"NSString"4@"NSURLResponse"8@"NSData"12@"NSError"16@"NSError"20i24i28"]`


